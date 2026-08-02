import { colors, images } from "@/constants";
import { formatPrice } from "@/lib/currency";
import { useCartStore } from "@/store/cart.store";
import { CartItemType } from "@/type";
import { Image, Text, TouchableOpacity, View } from "react-native";

const CartItem = ({ item }: { item: CartItemType }) => {
    const { increaseQty, decreaseQty, removeItem } = useCartStore();
    const unitPrice =
        item.price +
        (item.customizations?.reduce((sum, c) => sum + c.price, 0) ?? 0);
    return (
        <View className="cart-item">
            <View className="flex flex-row items-center gap-x-3">
                <View className="cart-item__image">
                    <Image
                        source={{ uri: item.image_url }}
                        className="size-4/5 rounded-lg"
                        resizeMode="cover"
                    />
                </View>
                <View>
                    <Text className="base-bold text-dark-100">{item.name}</Text>
                    {item.customizations && item.customizations.length > 0 && (
                        <Text className="body-regular text-gray-200 mt-0.5" numberOfLines={2}>
                            {item.customizations.map((c) => c.name).join(", ")}
                        </Text>
                    )}
                    <Text className="paragraph-bold text-primary mt-1">
                        {formatPrice(unitPrice)}
                    </Text>
                    <View className="flex flex-row items-center gap-x-4 mt-2">
                        <TouchableOpacity
                            onPress={() => decreaseQty(item.id, item.customizations!)}
                            className="cart-item__actions"
                        >
                            <Image
                                source={images.minus}
                                className="size-1/2"
                                resizeMode="contain"
                                tintColor={colors.primary}
                            />
                        </TouchableOpacity>
                        <Text className="base-bold text-dark-100">{item.quantity}</Text>
                        <TouchableOpacity
                            onPress={() => increaseQty(item.id, item.customizations!)}
                            className="cart-item__actions"
                        >
                            <Image
                                source={images.plus}
                                className="size-1/2"
                                resizeMode="contain"
                                tintColor={colors.primary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <TouchableOpacity
                onPress={() => removeItem(item.id, item.customizations!)}
                className="flex-center"
            >
                <Image source={images.trash} className="size-5" resizeMode="contain" />
            </TouchableOpacity>
        </View>
    );
};

export default CartItem;