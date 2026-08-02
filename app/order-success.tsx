import CustomButton from "@/components/customButton";
import { images } from "@/constants";
import { router, useLocalSearchParams } from "expo-router";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OrderSuccess = () => {
    const { orderId } = useLocalSearchParams<{ orderId: string }>();

    return (
        <SafeAreaView className="bg-white flex-1 px-5">
            <View className="flex-1 items-center justify-center">
                <Image
                    source={images.success}
                    className="size-32 mb-6"
                    resizeMode="contain"
                />
                <Text className="h1-bold text-dark-100">Order Placed!</Text>
                <Text className="body-medium text-gray-200 text-center mt-2 px-8">
                    Your order has been received. We&apos;re preparing it now.
                </Text>
                {orderId && (
                    <View className="mt-4 bg-primary/10 rounded-full px-4 py-2">
                        <Text className="paragraph-semibold text-primary">
                            Order #{orderId.slice(-6).toUpperCase()}
                        </Text>
                    </View>
                )}
            </View>

            <View className="pb-10 gap-4">
                <CustomButton
                    title="Track Order"
                    onPress={() => router.replace("/orders")}
                />
                <CustomButton
                    title="Continue Shopping"
                    onPress={() => router.replace("/")}
                />
            </View>
        </SafeAreaView>
    );
};

export default OrderSuccess;
