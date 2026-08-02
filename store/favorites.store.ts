import { getFavoriteMenuIds, updateFavoriteMenuIds } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { create } from "zustand";

type FavoritesState = {
    favoriteIds: string[];
    isLoading: boolean;
    loadFavorites: () => Promise<void>;
    toggleFavorite: (menuId: string) => Promise<void>;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    favoriteIds: [],
    isLoading: false,

    loadFavorites: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ isLoading: true });
        try {
            const ids = await getFavoriteMenuIds();
            set({ favoriteIds: ids });
        } catch (e) {
            console.log("loadFavorites error", e);
        } finally {
            set({ isLoading: false });
        }
    },

    toggleFavorite: async (menuId) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const current = get().favoriteIds;
        const isFavorite = current.includes(menuId);
        const next = isFavorite
            ? current.filter((id) => id !== menuId)
            : [...current, menuId];

        set({ favoriteIds: next });

        try {
            await updateFavoriteMenuIds({ userId: user.$id, menuId });
        } catch (e) {
            set({ favoriteIds: current });
            console.log("toggleFavorite error", e);
        }
    },
}));
