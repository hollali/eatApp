<div align="center">
  <div>
    <img src="https://img.shields.io/badge/-React_Native-black?style=for-the-badge&logoColor=white&logo=react&color=61DAFB" alt="React Native" />
    <img src="https://img.shields.io/badge/-Expo-black?style=for-the-badge&logoColor=white&logo=expo&color=000020" alt="Expo" />
    <img src="https://img.shields.io/badge/-Appwrite-black?style=for-the-badge&logoColor=white&logo=appwrite&color=F02E65" alt="Appwrite" />
    <img src="https://img.shields.io/badge/-Tailwind-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="Tailwind" />
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="TypeScript" />
  </div>

  <h3 align="center">eatApp — Food Delivery Mobile App</h3>
</div>

## 📋 Table of Contents

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🗄️ [Appwrite Backend](#appwrite-backend)
5. 🤸 [Quick Start](#quick-start)
6. 🚀 [Scripts](#scripts)
7. 🧪 [Testing & CI](#testing--ci)
8. 🚢 [Production Checklist](#production-checklist)

## <a name="introduction">🤖 Introduction</a>

A full-stack food delivery app built with React Native (Expo), TypeScript, and NativeWind (Tailwind). It includes email/password authentication, dynamic search with category filters, a product detail page with customizable add-ons, a persistent cart, Mobile Money checkout with order tracking, favorites, and a profile page with avatar uploads. The backend is powered by Appwrite (auth, database, and file storage), with error tracking via Sentry.

## <a name="tech-stack">⚙️ Tech Stack</a>

- **[Expo SDK 54](https://expo.dev/)** — React Native framework with file-based routing (Expo Router), typed routes, fast refresh, and OTA updates.
- **[React Native 0.81](https://reactnative.dev/)** — cross-platform UI framework (New Architecture enabled).
- **[TypeScript](https://www.typescriptlang.org/)** — strict static typing.
- **[NativeWind 4](https://www.nativewind.dev/)** — Tailwind CSS utilities for React Native.
- **[Appwrite](https://appwrite.io/)** — backend-as-a-service for authentication, database, and file storage.
- **[Zustand 5](https://github.com/pmndrs/zustand)** — global state (auth, cart, favorites); the cart persists via AsyncStorage.
- **[Sentry](https://sentry.io/)** — error tracking and performance monitoring.

## <a name="features">🔋 Features</a>

- **Authentication** — email/password sign up and sign in with Appwrite sessions.
- **Home** — latest offers, "Popular Near You" carousel, category shortcuts, and live city detection via `expo-location`.
- **Search** — keyword search with a 300 ms debounce plus category filters.
- **Product Details** — images, nutrition info, and customizable toppings/sides before adding to cart.
- **Favorites** — heart any item to save it; dedicated Favorites screen; synced to your Appwrite account.
- **Cart** — review items, adjust quantities, live summary, and persistence across app restarts.
- **Checkout & Orders** — delivery address, Mobile Money payment (MTN, AirtelTigo, Telecel), order status tracking on the Orders screen.
- **Profile** — view/edit account info, upload an avatar photo, link to Orders and Favorites, sign out.
- **Error Tracking** — Sentry captures exceptions and sessions.

> ⚠️ Mobile Money payments are **simulated** in `lib/payment.ts` (2 s delay, no real charge). See the [Production Checklist](#production-checklist) before going live.

## <a name="appwrite-backend">🗄️ Appwrite Backend</a>

The project expects a single Appwrite database with the following collections. Collection IDs live in `.env` (all prefixed `EXPO_PUBLIC_APPWRITE_*_COLLECTION_ID`). Attributes marked `?` are optional.

**`users`**
| Attribute | Type |
| --- | --- |
| `name`, `email`, `accountId` | string |
| `avatar` | string (URL) |
| `favoriteMenuIds?` | array of string |

**`categories`**
| Attribute | Type |
| --- | --- |
| `name` | string |
| `description` | string |

**`menu`**
| Attribute | Type |
| --- | --- |
| `name`, `description`, `image_url` | string |
| `price` | double |
| `rating`, `calories`, `protein` | double |
| `categories` | relation/string |

**`customizations`**
| Attribute | Type |
| --- | --- |
| `name` | string |
| `price` | double |
| `type` | string |

**`menu_customizations`** (join table between `menu` and `customizations`)
| Attribute | Type |
| --- | --- |
| `menu` | relation/string |
| `customizations` | relation/string |

**`orders`**
| Attribute | Type |
| --- | --- |
| `user` | string (user doc ID) — **index this** |
| `items` | array of string (JSON-encoded order lines) |
| `subtotal`, `deliveryFee`, `discount`, `total` | double |
| `paymentMethod` | string |
| `paymentPhone?`, `mobileMoneyProvider?` | string |
| `address` | string (JSON) |
| `status` | string (`pending` / `confirmed` / `preparing` / `out_for_delivery` / `delivered` / `cancelled`) |

`items` and `address` are stored as JSON strings because Appwrite array attributes only support primitive strings; `lib/appwrite.ts` serializes on write (`createOrder`) and parses on read (`getOrders`).

> The `orders` collection and its attributes are created automatically by `npm run seed:orders` (see [Scripts](#scripts)). The `users` collection needs a `favoriteMenuIds` (array of string) attribute for favorites to persist.

## <a name="quick-start">🤸 Quick Start</a>

**Prerequisites**

- [Node.js](https://nodejs.org/en) 20+
- [npm](https://www.npmjs.com/)
- An [Appwrite](https://appwrite.io/) project with the database and collections above

**Installation**

```bash
npm install
```

**Set Up Environment Variables**

```bash
cp .env.example .env
```

Fill in every value. Appwrite values come from your Appwrite console:

```env
# Appwrite
EXPO_PUBLIC_APPWRITE_PROJECT_ID=
EXPO_PUBLIC_APPWRITE_ENDPOINT=
EXPO_PUBLIC_APPWRITE_PLATFORM=
EXPO_PUBLIC_APPWRITE_DATABASE_ID=
EXPO_PUBLIC_APPWRITE_BUCKET_ID=
EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID=
EXPO_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID=
EXPO_PUBLIC_APPWRITE_MENU_COLLECTION_ID=
EXPO_PUBLIC_APPWRITE_CUSTOMIZATIONS_COLLECTION_ID=
EXPO_PUBLIC_APPWRITE_MENU_CUSTOMIZATION_COLLECTION_ID=
EXPO_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID=

# Sentry (optional)
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_SENTRY_URL=
EXPO_PUBLIC_SENTRY_PROJECT=
EXPO_PUBLIC_SENTRY_ORGANIZATION=
```

**Seed the Database**

Catalog data (categories, menu, customizations, menu images) is defined in `lib/data.ts` and inserted by `lib/seed.ts`. Run it once from the app environment (it uses `react-native-appwrite`, which cannot execute in Node).

Create the `orders` collection + attributes and seed demo orders with (requires a server **API key**):

```bash
APPWRITE_API_KEY=<key> npm run seed:orders
```

**Running the Project**

```bash
npx expo start
```

Scan the QR code with Expo Go (or press `a` for Android / `i` for iOS).

## <a name="scripts">🚀 Scripts</a>

| Script | Description |
| --- | --- |
| `npm run start` | Start the Expo dev server |
| `npm run android` / `ios` / `web` | Start and open on a platform |
| `npm run lint` | ESLint (`expo lint`) |
| `npm run typecheck` | Type-check the codebase (`tsc --noEmit`) |
| `npm test` | Run unit tests (Jest) |
| `npm run seed:orders` | Create the `orders` collection/attributes/index and seed demo orders (requires `APPWRITE_API_KEY`) |

## <a name="testing--ci">🧪 Testing & CI</a>

- **Unit tests** — `jest-expo` preset with an AsyncStorage mock. Covers currency formatting (`lib/currency.test.ts`) and cart store behavior (`store/cart.store.test.ts`).
- **Typecheck & lint** — `npm run typecheck` and `npm run lint` must stay clean.
- **Continuous integration** — `.github/workflows/ci.yml` runs typecheck, lint, and tests on every push/PR to `main`.

## <a name="production-checklist">🚢 Production Checklist</a>

Before shipping, work through these items:

- [ ] **Real Mobile Money** — replace the simulated `initiateMobileMoneyPayment` in `lib/payment.ts` with a real provider (Hubtel, ExpressPay, or the MTN MoMo Open API) called through a backend route so payment keys never reach the client.
- [ ] **Secure Appwrite** — the Appwrite platform value (`EXPO_PUBLIC_APPWRITE_PLATFORM`) is a dev-only restriction; enforce production security via proper sessions, bucket file permissions, and scoped API keys. Never embed a server API key in the app bundle.
- [ ] **Order permissions** — the `orders` collection currently allows `read("any")` for development. Lock down document access (e.g. per-user document permissions) before launch.
- [ ] **Sentry** — set real `EXPO_PUBLIC_SENTRY_*` values in the build environment.
- [ ] **App icons/splash** — replace placeholder assets in `assets/images/`.
- [ ] **Build & release** — configure `eas.json` and ship with EAS Build:

  ```bash
  npx eas-cli login
  npx eas-cli build --platform all --profile production
  ```

- [ ] **Environment hygiene** — keep `.env` out of source control (already gitignored) and inject `EXPO_PUBLIC_*` values via EAS environment/secrets at build time.
