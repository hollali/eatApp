import { CreateUserParams, GetMenuParams, SignInParams, } from '@/type';
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

export const appwriteConfig = {
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    androidProject: process.env.EXPO_PUBLIC_APPWRITE_ANDROID_PROJECT_ID!,
	endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    platform: "com.hollali.eatApp",
    databaseId: '686b7b4f000b31a8b2f6',
    bucketId: '686ff46f000e84a9b871',
    userCollectionId: '686b7b9f00160656de2a',
    categoriesCollectionId: '686fafb400257faa137e',
    menuCollectionId:'686fb0cf001daee41779',
    customizationsCollectionId: '686fb3fd0031b16258e6',
    menuCustomizationCollectionId: '686fb686003b3601fdcf'
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

export const createUser = async ({email, password, name}: CreateUserParams) => {
    try {
        const newAccount = await account.create(ID.unique(),email,password,name)
        if(!newAccount) throw Error;
        await signIn({ email, password });

        const avatarUrl = await avatars.getInitialsURL(name);

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            { name, email,accountId: newAccount.$id, avatar:avatarUrl}
        );
    } catch (e) {
        throw new Error((e as Error).message);
    }
}

export const signIn = async ({email,password}: SignInParams) => {
    try {
        const session = await account.createEmailPasswordSession(email, password);
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw new Error;
        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )
        if (!currentUser) throw  Error;
        return currentUser.documents[0];
    } catch (e) {
        console.log(e);
        throw new Error(e as string);
    }
}

export const getMenu = async ({ category, query }: GetMenuParams) => {
    try {
        const queries: string[] = [];
        if(category) queries.push(Query.equal('categories', category));
        if(query) queries.push(Query.search('name', query));
        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries,
        )
        return menus.documents;
    } catch (e) {
        throw new Error(e as string);
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
        throw new Error(e as string);
    }
}