import CustomHeader from "@/components/customHeader";
import MenuCard from "@/components/menuCard";
import { getFavoriteMenuItems } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import useAuthStore from "@/store/auth.store";
import { MenuItem } from "@/type";
import cn from "clsx";
import { Redirect, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Favorites = () => {
    const { isAuthenticated } = useAuthStore();
    const { data, loading, refetch } = useAppwrite({ fn: getFavoriteMenuItems });

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    if (!isAuthenticated) return <Redirect href="/sign-in" />;

    const items = (data as MenuItem[] | null) ?? [];

    return (
        <SafeAreaView className="bg-white flex-1">
            <FlatList
                className="px-5 pt-5"
                data={items}
                renderItem={({ item, index }) => (
                    <View
                        className={cn(
                            "flex-1 max-w-[48%]",
                            index % 2 === 1 ? "mt-10" : "mt-0"
                        )}
                    >
                        <MenuCard item={item} />
                    </View>
                )}
                keyExtractor={(item) => item.$id}
                numColumns={2}
                columnWrapperClassName="gap-7"
                contentContainerClassName="gap-7 pb-32"
                ListHeaderComponent={
                    <CustomHeader title="My Favorites" />
                }
                ListEmptyComponent={() =>
                    loading ? (
                        <ActivityIndicator size="large" color="#FE8C00" className="mt-10" />
                    ) : (
                        <View className="flex-1 items-center justify-center mt-20">
                            <Text className="h3-bold text-dark-100">
                                No favorites yet
                            </Text>
                            <Text className="body-medium text-gray-200 mt-2">
                                Tap the heart on any item to save it here
                            </Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
};

export default Favorites;
