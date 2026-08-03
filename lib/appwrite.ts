import { CreateOrderParams, CreateUserParams, GetMenuParams, SignInParams, } from '@/type';
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : String(error);

const isUnauthenticatedError = (error: unknown) =>
    error instanceof Error && error.message.includes("missing scopes");

const requireEnv = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable ${name}. Check your .env file.`);
    }
    return value;
};

export const appwriteConfig = {
    projectId: requireEnv("EXPO_PUBLIC_APPWRITE_PROJECT_ID"),
    endpoint: requireEnv("EXPO_PUBLIC_APPWRITE_ENDPOINT"),
    platform: requireEnv("EXPO_PUBLIC_APPWRITE_PLATFORM"),
    databaseId: requireEnv("EXPO_PUBLIC_APPWRITE_DATABASE_ID"),
    bucketId: requireEnv("EXPO_PUBLIC_APPWRITE_BUCKET_ID"),
    userCollectionId: requireEnv("EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID"),
    categoriesCollectionId: requireEnv("EXPO_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID"),
    menuCollectionId: requireEnv("EXPO_PUBLIC_APPWRITE_MENU_COLLECTION_ID"),
    customizationsCollectionId: requireEnv("EXPO_PUBLIC_APPWRITE_CUSTOMIZATIONS_COLLECTION_ID"),
    menuCustomizationCollectionId: requireEnv("EXPO_PUBLIC_APPWRITE_MENU_CUSTOMIZATION_COLLECTION_ID"),
    ordersCollectionId: requireEnv("EXPO_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID")
};

export const client = new Client();
client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform) // Use this only for development, not recommended for production

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

export const createUser = async ({ email, password, name }: CreateUserParams) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, name)
        if (!newAccount) throw new Error("Account creation failed");
        await signIn({ email, password });

        const avatarUrl = await avatars.getInitialsURL(name);

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            { name, email, accountId: newAccount.$id, avatar: avatarUrl }
        );
    } catch (e) {
        throw new Error(getErrorMessage(e));
    }
}

export const signIn = async ({ email, password }: SignInParams) => {
    try {
        try { await account.deleteSessions(); } catch { }
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (e) {
        throw new Error(getErrorMessage(e));
    }
}

export const recoverPassword = async ({ email, redirectUrl }: { email: string; redirectUrl: string }) => {
    try {
        await account.createRecovery(email, redirectUrl);
    } catch (e) {
        throw new Error(getErrorMessage(e));
    }
}

export const resetPassword = async ({ userId, secret, password }: { userId: string; secret: string; password: string }) => {
    try {
        await account.updateRecovery(userId, secret, password);
    } catch (e) {
        throw new Error(getErrorMessage(e));
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw new Error("No active session");

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        );
        const user = currentUser.documents[0];
        if (!user) throw new Error("User not found");

        return user;
    } catch (e) {
        if (isUnauthenticatedError(e)) return null;
        throw new Error(getErrorMessage(e));
    }
}

export const getMenu = async ({ category, query, limit }: GetMenuParams) => {
    try {
        const queries: string[] = [];
        if (category) queries.push(Query.equal('categories', category));
        if (query) queries.push(Query.search('name', query));
        if (limit) queries.push(Query.limit(limit));
        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries,
        )
        return menus.documents;
    } catch (e) {
        throw new Error(getErrorMessage(e));
    }
}

export const getMenuById = async ({ id }: { id: string }) => {
    try {
        return await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            id,
        );
    } catch (e) {
        throw new Error(getErrorMessage(e));
    }
}

export const getCustomizations = async ({ menuId }: { menuId: string }) => {
    try {
        const links = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCustomizationCollectionId,
            [Query.equal('menu', menuId)]
        );

        const ids = links.documents.map((doc) => doc.customizations);
        if (ids.length === 0) return [];

        const customizations = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.customizationsCollectionId,
            [Query.equal('$id', ids)]
        );

        return customizations.documents;
    } catch (e) {
        throw new Error(getErrorMessage(e));
    }
}

export const updateUserName = async ({ userId, name }: { userId: string; name: string }) => {
    try {
        await account.updateName(name);
        return await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId,
            { name }
        );
    } catch (e) {
        throw new Error(getErrorMessage(e));
    }
}

export const updateUserEmail = async ({ userId, email, password }: { userId: string; email: string; password: string }) => {
    try {
        await account.updateEmail(email, password);
        return await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId,
            { email }
        );
    } catch (e) {
        throw new Error(getErrorMessage(e));
    }
}

export const createOrder = async ({
    items,
    subtotal,
    total,
    deliveryFee,
    discount,
    paymentMethod,
    paymentPhone,
    mobileMoneyProvider,
    address,
}: CreateOrderParams) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("You must be signed in to place an order");

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            ID.unique(),
            {
                user: currentUser.$id,
                items: items.map((item) => JSON.stringify(item)),
                subtotal,
                total,
                deliveryFee,
                discount,
                paymentMethod,
                paymentPhone,
                mobileMoneyProvider,
                address: JSON.stringify(address),
                status: "pending",
            }
        );
    } catch (e) {
        throw new Error(getErrorMessage(e));
    }
}

export const getOrders = async () => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("You must be signed in to view orders");

        const orders = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            [
                Query.equal('user', currentUser.$id),
                Query.orderDesc('$createdAt'),
            ]
        );

        return orders.documents.map((doc) => {
            const raw = doc as unknown as { items?: string[]; address?: string };
            return {
                ...doc,
                items: (raw.items ?? []).map((item) => JSON.parse(item)),
                address: raw.address ? JSON.parse(raw.address) : undefined,
            };
        });
    } catch (e) {
        throw new Error(getErrorMessage(e));
    }
}

export const getFavoriteMenuIds = async () => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("You must be signed in");
        return ((currentUser as { favoriteMenuIds?: string[] }).favoriteMenuIds ?? []);
    } catch (e) {
        throw new Error(getErrorMessage(e));
    }
}

export const updateFavoriteMenuIds = async ({ userId, menuId }: { userId: string; menuId: string }) => {
    try {
        const user = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId
        );
        const ids = (user as { favoriteMenuIds?: string[] }).favoriteMenuIds ?? [];
        const next = ids.includes(menuId)
            ? ids.filter((id) => id !== menuId)
            : [...ids, menuId];

        return await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId,
            { favoriteMenuIds: next }
        );
    } catch (e) {
        throw new Error(getErrorMessage(e));
    }
}

export const getFavoriteMenuItems = async () => {
    try {
        const ids = await getFavoriteMenuIds();
        if (ids.length === 0) return [];

        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            [Query.equal('$id', ids)]
        );
        return menus.documents;
    } catch (e) {
        throw new Error(getErrorMessage(e));
    }
}

export const uploadAvatar = async ({ userId, uri, mimeType, fileSize }: { userId: string; uri: string; mimeType: string; fileSize?: number }) => {
    try {
        const file = await storage.createFile(
            appwriteConfig.bucketId,
            ID.unique(),
            {
                name: `avatar-${Date.now()}.jpg`,
                type: mimeType,
                size: fileSize ?? 0,
                uri,
            }
        );

        const avatar = storage.getFileViewURL(appwriteConfig.bucketId, file.$id).toString();

        await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId,
            { avatar }
        );

        return avatar;
    } catch (e) {
        throw new Error(getErrorMessage(e));
    }
}

export const signOut = async () => {
    try {
        await account.deleteSession({ sessionId: 'current' });
    } catch (e) {
        throw new Error(getErrorMessage(e));
    }
}

export const getCategories = async () => {
    try {
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
        )
        return categories.documents;
    } catch (e) {
        throw new Error(getErrorMessage(e));
    }
}