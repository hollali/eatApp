import CustomButton from "@/components/customButton";
import CustomHeader from "@/components/customHeader";
import CustomInput from "@/components/customInput";
import { images } from "@/constants";
import { DELIVERY_FEE, DISCOUNT } from "@/constants/order";
import { createOrder } from "@/lib/appwrite";
import { formatPrice } from "@/lib/currency";
import { getAddressFromCurrentLocation, GeocodedAddress } from "@/lib/location";
import { initiateMobileMoneyPayment } from "@/lib/payment";
import { useCartStore } from "@/store/cart.store";
import useAuthStore from "@/store/auth.store";
import { MobileMoneyProvider, PaymentMethod } from "@/type";
import cn from "clsx";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PROVIDERS: MobileMoneyProvider[] = ["MTN", "AirtelTigo", "Telecel"];

const Checkout = () => {
    const { isAuthenticated } = useAuthStore();
    const { items, clearCart, getTotalItems, getTotalPrice } = useCartStore();

    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [note, setNote] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
    const [provider, setProvider] = useState<MobileMoneyProvider>("MTN");
    const [phone, setPhone] = useState("");
    const [isPlacing, setIsPlacing] = useState(false);
    const [geoAddress, setGeoAddress] = useState<GeocodedAddress | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    if (!isAuthenticated) return null;

    const subtotal = getTotalPrice();
    const total = subtotal + DELIVERY_FEE - DISCOUNT;
    const totalItems = getTotalItems();

    const handleDetectLocation = async () => {
        if (isLocating) return;
        setIsLocating(true);
        try {
            const address = await getAddressFromCurrentLocation();
            setGeoAddress(address);
            setStreet(address.street);
            setCity(address.city);
        } catch (error) {
            Alert.alert(
                "Location Error",
                error instanceof Error ? error.message : String(error)
            );
        } finally {
            setIsLocating(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (totalItems === 0) return;

        if (!street.trim() || !city.trim()) {
            return Alert.alert("Error", "Please enter your delivery address");
        }

        if (paymentMethod === "mobile_money") {
            if (!phone.trim()) {
                return Alert.alert("Error", "Enter your mobile money number");
            }
            const result = await initiateMobileMoneyPayment({
                amount: total,
                phone,
                provider,
            });
            if (!result.success) {
                return Alert.alert("Payment Failed", result.message);
            }
            Alert.alert("Payment Approved", result.message);
        }

        setIsPlacing(true);
        try {
            const order = await createOrder({
                items: items.map(({ id, name, price, quantity, customizations }) => ({
                    id,
                    name,
                    price,
                    quantity,
                    customizations,
                })),
                subtotal,
                deliveryFee: DELIVERY_FEE,
                discount: DISCOUNT,
                total,
                paymentMethod,
                paymentPhone: paymentMethod === "mobile_money" ? phone : undefined,
                mobileMoneyProvider: paymentMethod === "mobile_money" ? provider : undefined,
                address: {
                    street: street.trim(),
                    city: city.trim(),
                    note: note.trim() || undefined,
                    latitude: geoAddress?.latitude,
                    longitude: geoAddress?.longitude,
                },
            });

            clearCart();
            router.replace({
                pathname: "/order-success",
                params: { orderId: order.$id },
            });
        } catch (error) {
            Alert.alert(
                "Error",
                error instanceof Error ? error.message : String(error)
            );
        } finally {
            setIsPlacing(false);
        }
    };

    return (
        <SafeAreaView className="bg-white flex-1">
            <ScrollView contentContainerClassName="px-5 pb-32">
                <CustomHeader title="Checkout" />

                {totalItems === 0 ? (
                    <View className="flex-1 items-center justify-center mt-20">
                        <Text className="h3-bold text-dark-100">
                            Your cart is empty
                        </Text>
                    </View>
                ) : (
                    <>
                        <Text className="h3-bold text-dark-100 mb-4">
                            Delivery Address
                        </Text>
                        <TouchableOpacity
                            onPress={handleDetectLocation}
                            disabled={isLocating}
                            className={cn(
                                "flex-row items-center justify-center gap-2 rounded-2xl border border-primary py-3.5 mb-4",
                                isLocating ? "bg-primary/5 opacity-60" : "bg-primary/5 active:bg-primary/10"
                            )}
                        >
                            {isLocating ? (
                                <ActivityIndicator size="small" color="#FE8C00" />
                            ) : (
                                <Image source={images.location} className="size-4" tintColor="#FE8C00" />
                            )}
                            <Text className="paragraph-semibold text-primary">
                                {isLocating ? "Detecting location..." : "Use my current location"}
                            </Text>
                        </TouchableOpacity>
                        {geoAddress && (
                            <Text className="body-regular text-gray-200 mb-4">
                                Location detected: {geoAddress.latitude.toFixed(4)}, {geoAddress.longitude.toFixed(4)}
                            </Text>
                        )}
                        <View className="gap-5">
                            <CustomInput
                                label="Street / Area"
                                placeholder="e.g. 12 Independence Avenue"
                                value={street}
                                onChangeText={setStreet}
                            />
                            <CustomInput
                                label="City"
                                placeholder="e.g. Accra"
                                value={city}
                                onChangeText={setCity}
                            />
                            <CustomInput
                                label="Delivery Note (optional)"
                                placeholder="e.g. Call on arrival"
                                value={note}
                                onChangeText={setNote}
                            />
                        </View>

                        <Text className="h3-bold text-dark-100 mt-8 mb-4">
                            Payment Method
                        </Text>
                        <View className="gap-3">
                            {(
                                [
                                    { id: "mobile_money", title: "Mobile Money", subtitle: "Pay with MTN / AirtelTigo / Telecel" },
                                    { id: "cash", title: "Cash on Delivery", subtitle: "Pay when your order arrives" },
                                ] as { id: PaymentMethod; title: string; subtitle: string }[]
                            ).map((option) => {
                                const selected = paymentMethod === option.id;
                                return (
                                    <TouchableOpacity
                                        key={option.id}
                                        onPress={() => setPaymentMethod(option.id)}
                                        className={cn(
                                            "border rounded-2xl p-4 flex-row items-center",
                                            selected
                                                ? "border-primary bg-primary/10"
                                                : "border-gray-200 bg-white"
                                        )}
                                    >
                                        <View
                                            className={cn(
                                                "size-5 rounded-full border-2 mr-3",
                                                selected ? "border-primary" : "border-gray-300"
                                            )}
                                        >
                                            {selected && (
                                                <View className="flex-1 m-1 rounded-full bg-primary" />
                                            )}
                                        </View>
                                        <View>
                                            <Text className="paragraph-bold text-dark-100">
                                                {option.title}
                                            </Text>
                                            <Text className="body-regular text-gray-200">
                                                {option.subtitle}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {paymentMethod === "mobile_money" && (
                            <View className="mt-5 gap-5">
                                <View className="flex-row flex-wrap gap-2">
                                    {PROVIDERS.map((p) => {
                                        const active = provider === p;
                                        return (
                                            <TouchableOpacity
                                                key={p}
                                                onPress={() => setProvider(p)}
                                                className={cn(
                                                    "px-4 py-2.5 rounded-full border",
                                                    active
                                                        ? "bg-primary border-primary"
                                                        : "bg-white border-gray-200"
                                                )}
                                            >
                                                <Text
                                                    className={cn(
                                                        "paragraph-semibold",
                                                        active ? "text-white" : "text-dark-100"
                                                    )}
                                                >
                                                    {p}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                                <CustomInput
                                    label="Mobile Money Number"
                                    placeholder="e.g. 0241234567"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        )}

                        <View className="mt-8 border border-gray-200 p-5 rounded-2xl">
                            <Text className="h3-bold text-dark-100 mb-5">
                                Order Summary
                            </Text>
                            <View className="flex-between flex-row my-1">
                                <Text className="paragraph-medium text-gray-200">
                                    Total Items ({totalItems})
                                </Text>
                                <Text className="paragraph-bold text-dark-100">
                                    {formatPrice(subtotal)}
                                </Text>
                            </View>
                            <View className="flex-between flex-row my-1">
                                <Text className="paragraph-medium text-gray-200">
                                    Delivery Fee
                                </Text>
                                <Text className="paragraph-bold text-dark-100">
                                    {formatPrice(DELIVERY_FEE)}
                                </Text>
                            </View>
                            <View className="flex-between flex-row my-1">
                                <Text className="paragraph-medium text-gray-200">
                                    Discount
                                </Text>
                                <Text className="paragraph-bold text-success">
                                    - {formatPrice(DISCOUNT)}
                                </Text>
                            </View>
                            <View className="border-t border-gray-300 my-2" />
                            <View className="flex-between flex-row my-1">
                                <Text className="base-bold text-dark-100">Total</Text>
                                <Text className="base-bold text-dark-100">
                                    {formatPrice(total)}
                                </Text>
                            </View>
                        </View>

                        <View className="mt-8">
                            <CustomButton
                                title={
                                    paymentMethod === "mobile_money"
                                        ? "Pay & Place Order"
                                        : "Place Order"
                                }
                                isLoading={isPlacing}
                                onPress={handlePlaceOrder}
                            />
                        </View>
                        {paymentMethod === "mobile_money" && (
                            <Text className="body-regular text-gray-200 text-center mt-3">
                                Simulated payment for demo purposes
                            </Text>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Checkout;
