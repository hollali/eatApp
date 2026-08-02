import { appwriteConfig } from "@/lib/appwrite";
import { formatPrice } from "@/lib/currency";
import { useCartStore } from "@/store/cart.store";
import { useFavoritesStore } from "@/store/favorites.store";
import { MenuItem } from "@/type";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Platform, Pressable, Text, TouchableOpacity } from 'react-native';

const MenuCard = ({ item: { $id, image_url, name, price }}: { item: MenuItem}) => {
    const imageUrl = `${image_url}?project=${appwriteConfig.projectId}`;
    const { addItem } = useCartStore();
    const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
    const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
    const isFavorite = favoriteIds.includes($id);

    return (
        <TouchableOpacity
            className="menu-card"
            style={Platform.OS === 'android' ? { elevation: 10, shadowColor: '#878787'}: {}}
            onPress={() => router.push(`/menu/${$id}`)}
        >
            <Pressable
                className="absolute top-3 right-3 z-10 p-1.5"
                onPress={() => toggleFavorite($id)}
                hitSlop={8}
            >
                <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={22}
                    color={isFavorite ? "#F14141" : "#5D5F6D"}
                />
            </Pressable>
            <Image source={{ uri: imageUrl }} className="size-32 absolute -top-10" resizeMode="contain" />
            <Text className="text-center base-bold text-dark-100 mb-2" numberOfLines={1}>{name}</Text>
            <Text className="body-regular text-gray-200 mb-4">From {formatPrice(price)}</Text>
            <TouchableOpacity onPress={() => addItem({ id: $id, name, price, image_url: imageUrl, customizations: []})}>
                <Text className="paragraph-bold text-primary">Add to Cart +</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    )
}
export default MenuCard
