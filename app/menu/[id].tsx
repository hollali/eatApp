import CustomButton from "@/components/customButton";
import { images } from "@/constants";
import { appwriteConfig, getCustomizations, getMenuById } from "@/lib/appwrite";
import { formatPrice } from "@/lib/currency";
import useAppwrite from "@/lib/useAppwrite";
import { useCartStore } from "@/store/cart.store";
import { CartCustomization, Customization, MenuItem } from "@/type";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import cn from "clsx";

const getImageUrl = (url: string) =>
    `${url}${url.includes("?") ? "&" : "?"}project=${appwriteConfig.projectId}`;

const capitalize = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1);

const MenuDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { data: item } = useAppwrite({
        fn: getMenuById,
        params: { id: id ?? "" },
        skip: !id,
    });
    const { data: customizations } = useAppwrite({
        fn: getCustomizations,
        params: { menuId: id ?? "" },
        skip: !id,
    });
    const { addItem } = useCartStore();

    const [selected, setSelected] = useState<CartCustomization[]>([]);

    const groups = useMemo(() => {
        const byType = new Map<string, Customization[]>();
        for (const c of (customizations as Customization[] | null) ?? []) {
            const type = c.type || "Other";
            byType.set(type, [...(byType.get(type) ?? []), c]);
        }
        return Array.from(byType.entries());
    }, [customizations]);

    const toggleCustomization = (c: Customization) => {
        setSelected((prev) =>
            prev.some((x) => x.id === c.$id)
                ? prev.filter((x) => x.id !== c.$id)
                : [
                      ...prev,
                      { id: c.$id, name: c.name, price: c.price, type: c.type },
                  ]
        );
    };

    if (!id) return null;

    const menuItem = item as MenuItem | null;
    const customizationsTotal = selected.reduce(
        (sum, c) => sum + c.price,
        0
    );
    const total = (menuItem?.price ?? 0) + customizationsTotal;

    const handleAddToCart = () => {
        if (!menuItem) return;
        addItem({
            id: menuItem.$id,
            name: menuItem.name,
            price: menuItem.price,
            image_url: getImageUrl(menuItem.image_url),
            customizations: selected,
        });
        router.push("/cart");
    };

    return (
        <SafeAreaView className="bg-white flex-1">
            <ScrollView contentContainerClassName="px-5 pb-32">
                <View className="custom-header">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Image
                            source={images.arrowBack}
                            className="size-5"
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <Text className="base-semibold text-dark-100">Details</Text>
                    <View className="size-5" />
                </View>

                {!menuItem ? (
                    <Text className="body-medium text-gray-200 text-center mt-20">
                        Menu item not found
                    </Text>
                ) : (
                    <>
                        <View className="items-center bg-primary/10 rounded-3xl py-10">
                            <Image
                                source={{ uri: getImageUrl(menuItem.image_url) }}
                                className="size-52"
                                resizeMode="contain"
                            />
                        </View>

                        <View className="mt-5">
                            <Text className="h1-bold text-dark-100">
                                {menuItem.name}
                            </Text>
                            <View className="flex-row items-center gap-x-1 mt-1">
                                <Image
                                    source={images.star}
                                    className="size-4"
                                    resizeMode="contain"
                                />
                                <Text className="paragraph-bold text-primary">
                                    {menuItem.rating?.toFixed(1)}
                                </Text>
                            </View>
                            <Text className="body-regular text-gray-200 mt-3 leading-5">
                                {menuItem.description}
                            </Text>
                        </View>

                        <View className="flex-row gap-4 mt-5">
                            <View className="flex-1 bg-primary/10 rounded-2xl p-4">
                                <Text className="small-bold text-gray-200">
                                    Calories
                                </Text>
                                <Text className="h3-bold text-dark-100 mt-1">
                                    {menuItem.calories}
                                </Text>
                            </View>
                            <View className="flex-1 bg-primary/10 rounded-2xl p-4">
                                <Text className="small-bold text-gray-200">
                                    Protein
                                </Text>
                                <Text className="h3-bold text-dark-100 mt-1">
                                    {menuItem.protein}g
                                </Text>
                            </View>
                        </View>

                        {groups.map(([type, items]) => (
                            <View key={type} className="mt-6">
                                <Text className="h3-bold text-dark-100 mb-3">
                                    {capitalize(type)}
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {items.map((c) => {
                                        const isActive = selected.some(
                                            (x) => x.id === c.$id
                                        );
                                        return (
                                            <TouchableOpacity
                                                key={c.$id}
                                                onPress={() =>
                                                    toggleCustomization(c)
                                                }
                                                className={cn(
                                                    "px-5 py-2.5 rounded-full border",
                                                    isActive
                                                        ? "bg-primary border-primary"
                                                        : "bg-white border-gray-200"
                                                )}
                                            >
                                                <Text
                                                    className={cn(
                                                        "paragraph-semibold",
                                                        isActive
                                                            ? "text-white"
                                                            : "text-dark-100"
                                                    )}
                                                >
                                                    {c.name} · +{formatPrice(c.price)}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>

            {menuItem && (
                <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 flex-row items-center gap-4">
                    <View>
                        <Text className="small-bold text-gray-200">
                            Total Price
                        </Text>
                        <Text className="h1-bold text-primary">
                            {formatPrice(total)}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <CustomButton
                            title="Add to Cart"
                            onPress={handleAddToCart}
                        />
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

export default MenuDetails;
