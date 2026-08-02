#!/usr/bin/env node
import { readFileSync, existsSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const keyArg = args.find((a) => a.startsWith("--key="));
const API_KEY = process.env.APPWRITE_API_KEY ?? keyArg?.split("=")[1] ?? "";

const envPath = new URL("../.env", import.meta.url).pathname;
const env = {};
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
}

const PROJECT_ID = env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const ENDPOINT = env.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? "https://cloud.appwrite.io/v1";
const DATABASE_ID = env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const USER_COLLECTION_ID = env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID;

const COLLECTION_NAME = "orders";
const COLLECTION_ID = "orders";

if (!API_KEY || !PROJECT_ID || !DATABASE_ID || !USER_COLLECTION_ID) {
  console.error("Missing config. Provide APPWRITE_API_KEY (or --key=...) and check .env values.");
  process.exit(1);
}

const base = `${ENDPOINT}/databases/${DATABASE_ID}`;
const headers = {
  "Content-Type": "application/json",
  "X-Appwrite-Project": PROJECT_ID,
  "X-Appwrite-Key": API_KEY,
};

async function api(method, path, body) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = {};
  try { json = JSON.parse(text); } catch { /* noop */ }
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${json.message ?? text}`);
  }
  return json;
}

async function listCollections() {
  const all = [];
  let offset = 0;
  while (true) {
    const page = await api("GET", `/collections?limit=100&offset=${offset}`);
    all.push(...page.collections);
    if (all.length >= page.total) break;
    offset += 100;
  }
  return all;
}

const COLLECTION_PERMISSIONS = ['read("any")', 'create("users")', 'update("users")', 'delete("users")'];

async function ensureCollection() {
  const existing = await listCollections();
  const found = existing.find((c) => c.$id === COLLECTION_ID || c.name === COLLECTION_NAME);
  if (found) {
    await api("PUT", `/collections/${found.$id}`, {
      name: found.name ?? COLLECTION_NAME,
      enabled: found.enabled ?? true,
      documentSecurity: false,
      permissions: COLLECTION_PERMISSIONS,
    });
    console.log(`Collection "${COLLECTION_NAME}" exists (id: ${found.$id}); permissions ensured.`);
    return found.$id;
  }
  const created = await api("POST", "/collections", {
    collectionId: COLLECTION_ID,
    name: COLLECTION_NAME,
    enabled: true,
    documentSecurity: false,
    permissions: COLLECTION_PERMISSIONS,
  });
  console.log(`Created collection "${COLLECTION_NAME}" (id: ${created.$id}).`);
  return created.$id;
}

async function ensureAttribute(cid, key, type, body) {
  try {
    await api("POST", `/collections/${cid}/attributes/${type}`, { key, ...body });
    console.log(`  attribute ${key} -> created`);
  } catch (e) {
    if (String(e.message).includes("already exists")) {
      console.log(`  attribute ${key} -> exists`);
    } else {
      throw e;
    }
  }
}

const ATTRIBUTES = [
  { key: "user", type: "string", body: { size: 255, required: true, array: false } },
  { key: "items", type: "string", body: { size: 1024, required: true, array: true } },
  { key: "subtotal", type: "float", body: { required: true } },
  { key: "deliveryFee", type: "float", body: { required: true } },
  { key: "discount", type: "float", body: { required: true } },
  { key: "total", type: "float", body: { required: true } },
  { key: "paymentMethod", type: "string", body: { size: 32, required: true, array: false } },
  { key: "paymentPhone", type: "string", body: { size: 32, required: false, array: false } },
  { key: "mobileMoneyProvider", type: "string", body: { size: 32, required: false, array: false } },
  { key: "address", type: "string", body: { size: 1024, required: true, array: false } },
  { key: "status", type: "string", body: { size: 32, required: true, array: false } },
];

async function waitForAttributes(cid) {
  for (let i = 0; i < 30; i++) {
    const page = await api("GET", `/collections/${cid}/attributes`);
    if (page.attributes.every((a) => a.status === "available")) return page.attributes;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Timed out waiting for attributes to become available");
}

async function ensureIndex(cid) {
  try {
    await api("POST", `/collections/${cid}/indexes`, {
      key: "user_idx",
      type: "key",
      attributes: ["user"],
      orders: ["ASC"],
    });
    console.log("  index user_idx -> created");
  } catch (e) {
    if (String(e.message).includes("already exists")) {
      console.log("  index user_idx -> exists");
    } else {
      throw e;
    }
  }
}

async function seedOrders(cid, userId) {
  const item1 = {
    id: "demo-1",
    name: "Beef Burger",
    price: 20,
    quantity: 1,
    customizations: [{ id: "c1", name: "Extra Cheese", price: 2, type: "topping" }],
  };
  const item2 = { id: "demo-2", name: "Sprite", price: 5, quantity: 2 };
  const item3 = { id: "demo-3", name: "Grilled Chicken Wrap", price: 18, quantity: 1 };

  const orders = [
    {
      user: userId,
      items: [item1, item2].map((i) => JSON.stringify(i)),
      subtotal: 32,
      deliveryFee: 5,
      discount: 0,
      total: 37,
      paymentMethod: "mobile_money",
      paymentPhone: "0244000001",
      mobileMoneyProvider: "MTN",
      address: JSON.stringify({ street: "123 Independence Ave", city: "Accra" }),
      status: "pending",
    },
    {
      user: userId,
      items: [item3, item2].map((i) => JSON.stringify(i)),
      subtotal: 28,
      deliveryFee: 5,
      discount: 0.5,
      total: 32.5,
      paymentMethod: "mobile_money",
      paymentPhone: "0555000002",
      mobileMoneyProvider: "AirtelTigo",
      address: JSON.stringify({ street: "45 Adum", city: "Kumasi", note: "Ring the bell" }),
      status: "preparing",
    },
    {
      user: userId,
      items: [item1, item1].map((i) => JSON.stringify({ ...i, id: `${i.id}-b`, quantity: 2 })),
      subtotal: 40,
      deliveryFee: 5,
      discount: 2,
      total: 43,
      paymentMethod: "cash",
      address: JSON.stringify({ street: "15 Airport Rd", city: "Accra" }),
      status: "delivered",
    },
  ];

  const existing = await api("GET", `/collections/${cid}/documents?limit=1`);
  if (existing.total > 0) {
    console.log("Orders already exist - skipping seed.");
    return;
  }

  for (const order of orders) {
    await api("POST", `/collections/${cid}/documents`, {
      documentId: "unique()",
      data: order,
      permissions: ['read("any")', 'write("users")'],
    });
  }
  console.log(`Seeded ${orders.length} demo orders for user ${userId}.`);
}

function writeEnvVar(key, value) {
  if (!existsSync(envPath)) {
    writeFileSync(envPath, `${key}=${value}\n`);
    console.log(`Created .env with ${key}=${value}`);
    return;
  }
  const content = readFileSync(envPath, "utf8");
  const lines = content.split("\n");
  const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
  if (idx >= 0) {
    lines[idx] = `${key}=${value}`;
  } else {
    lines.push(`${key}=${value}`);
  }
  writeFileSync(envPath, lines.join("\n"));
  console.log(`Updated .env: ${key}=${value}`);
}

async function main() {
  const cid = await ensureCollection();
  for (const a of ATTRIBUTES) {
    await ensureAttribute(cid, a.key, a.type, a.body);
  }
  await waitForAttributes(cid);
  await ensureIndex(cid);

  const users = await api("GET", `/collections/${USER_COLLECTION_ID}/documents?limit=1`);
  const userId = users.documents[0]?.$id;
  if (!userId) {
    console.warn("No user documents found - created collection but skipped seeding.");
  } else {
    await seedOrders(cid, userId);
  }

  writeEnvVar("EXPO_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID", cid);
  console.log("Done.");
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
