import CustomHeader from "@/components/customHeader";
import { ORDER_STATUS_META } from "@/constants/order";
import { getOrders } from "@/lib/appwrite";
import { formatPrice } from "@/lib/currency";
import useAppwrite from "@/lib/useAppwrite";
import useAuthStore from "@/store/auth.store";
import { Order } from "@/type";
import { Redirect } from "expo-router";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Orders = () => {
    const { isAuthenticated } = useAuthStore();
    const { data, loading, refetch } = useAppwrite({ fn: getOrders });

    if (!isAuthenticated) return <Redirect href="/sign-in" />;

    const orders = (data as Order[] | null) ?? [];

    return (
        <SafeAreaView className="bg-white flex-1">
            <FlatList
                className="px-5 pt-5"
                data={orders}
                keyExtractor={(item) => item.$id}
                refreshing={loading}
                onRefresh={refetch}
                contentContainerClassName="pb-32"
                ListHeaderComponent={<CustomHeader title="My Orders" />}
                ListEmptyComponent={() =>
                    loading ? (
                        <ActivityIndicator size="large" color="#FE8C00" className="mt-10" />
                    ) : (
                        <View className="flex-1 items-center justify-center mt-20">
                            <Text className="h3-bold text-dark-100">
                                No orders yet
                            </Text>
                            <Text className="body-medium text-gray-200 mt-2">
                                Your orders will appear here
                            </Text>
                        </View>
                    )
                }
                renderItem={({ item }) => {
                    const status = ORDER_STATUS_META[item.status] ?? ORDER_STATUS_META.pending;
                    const date = new Date(item.$createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    });
                    return (
                        <View className="border border-gray-200 rounded-2xl p-4 mb-4">
                            <View className="flex-between flex-row">
                                <View>
                                    <Text className="base-bold text-dark-100">
                                        Order #{item.$id.slice(-6).toUpperCase()}
                                    </Text>
                                    <Text className="body-regular text-gray-200 mt-0.5">
                                        {date}
                                    </Text>
                                </View>
                                <View
                                    className="px-3 py-1 rounded-full"
                                    style={{ backgroundColor: `${status.color}1A` }}
                                >
                                    <Text
                                        className="small-bold"
                                        style={{ color: status.color }}
                                    >
                                        {status.label}
                                    </Text>
                                </View>
                            </View>

                            <Text className="body-medium text-gray-200 mt-3" numberOfLines={2}>
                                {item.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                            </Text>

                            <View className="border-t border-gray-100 my-3" />
                            <View className="flex-between flex-row">
                                <Text className="body-medium text-gray-200">
                                    {item.paymentMethod === "mobile_money"
                                        ? item.mobileMoneyProvider
                                        : "Cash on Delivery"}
                                </Text>
                                <Text className="base-bold text-dark-100">
                                    {formatPrice(item.total)}
                                </Text>
                            </View>
                        </View>
                    );
                }}
            />
        </SafeAreaView>
    );
};

export default Orders;
