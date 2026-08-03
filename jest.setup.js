jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const appwriteEnv = [
  "EXPO_PUBLIC_APPWRITE_PROJECT_ID",
  "EXPO_PUBLIC_APPWRITE_ENDPOINT",
  "EXPO_PUBLIC_APPWRITE_PLATFORM",
  "EXPO_PUBLIC_APPWRITE_DATABASE_ID",
  "EXPO_PUBLIC_APPWRITE_BUCKET_ID",
  "EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID",
  "EXPO_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID",
  "EXPO_PUBLIC_APPWRITE_MENU_COLLECTION_ID",
  "EXPO_PUBLIC_APPWRITE_CUSTOMIZATIONS_COLLECTION_ID",
  "EXPO_PUBLIC_APPWRITE_MENU_CUSTOMIZATION_COLLECTION_ID",
  "EXPO_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID",
];

for (const name of appwriteEnv) {
  process.env[name] = process.env[name] || "test";
}
