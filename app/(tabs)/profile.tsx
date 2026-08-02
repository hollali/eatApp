import CustomButton from "@/components/customButton";
import CustomHeader from "@/components/customHeader";
import { colors, images } from "@/constants";
import { updateUserEmail, updateUserName, uploadAvatar } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { ProfileFieldProps } from "@/type";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Alert, Image, ImageSourcePropType, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileField = ({ label, value, icon }: ProfileFieldProps) => (
    <View className="profile-field">
        <View className="profile-field__icon">
            <Image source={icon} className="size-5" resizeMode="contain" tintColor={colors.primary} />
        </View>
        <View className="flex-1">
            <Text className="body-medium text-gray-200">{label}</Text>
            <Text className="paragraph-bold text-dark-100">{value}</Text>
        </View>
    </View>
);

const EditField = ({
    label,
    value,
    icon,
    onChangeText,
    secureTextEntry = false,
    autoCapitalize = "none",
    keyboardType = "default",
}: {
    label: string;
    value: string;
    icon: ImageSourcePropType;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    autoCapitalize?: "none" | "words";
    keyboardType?: "default" | "email-address";
}) => (
    <View className="profile-field">
        <View className="profile-field__icon">
            <Image source={icon} className="size-5" resizeMode="contain" tintColor={colors.primary} />
        </View>
        <View className="flex-1">
            <Text className="body-medium text-gray-200 mb-1">{label}</Text>
            <TextInput
                className="input border-b border-gray-300"
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                autoCapitalize={autoCapitalize}
                autoCorrect={false}
                keyboardType={keyboardType}
                placeholderTextColor="#A0A0A0"
            />
        </View>
    </View>
);

const Profile = () => {
    const { user, signOut, setUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [password, setPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    useEffect(() => {
        if (!user) return;
        setName(user.name ?? "");
        setEmail(user.email ?? "");
        setPassword("");
    }, [user]);

    const memberSince = user?.$createdAt
        ? new Date(user.$createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
          })
        : "—";

    const handleSignOut = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", style: "destructive", onPress: () => signOut() },
        ]);
    };

    const handleAvatarPress = async () => {
        if (!user) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (result.canceled) return;
        const asset = result.assets[0];

        setIsUploadingAvatar(true);
        try {
            const avatar = await uploadAvatar({
                userId: user.$id,
                uri: asset.uri,
                mimeType: asset.mimeType ?? "image/jpeg",
                fileSize: asset.fileSize,
            });
            setUser({ ...user, avatar });
        } catch (error) {
            Alert.alert(
                "Error",
                error instanceof Error ? error.message : String(error)
            );
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        if (!name.trim()) return Alert.alert("Error", "Name cannot be empty");
        if (!email.trim()) return Alert.alert("Error", "Email cannot be empty");

        const nameChanged = name.trim() !== user.name;
        const emailChanged = email.trim() !== user.email;

        if (emailChanged && !password) {
            return Alert.alert(
                "Password Required",
                "Enter your current password to change your email address."
            );
        }

        setIsSaving(true);
        try {
            if (nameChanged) {
                await updateUserName({ userId: user.$id, name: name.trim() });
            }
            if (emailChanged) {
                await updateUserEmail({
                    userId: user.$id,
                    email: email.trim(),
                    password,
                });
            }
            setUser({ ...user, name: name.trim(), email: email.trim() });
            setPassword("");
            setIsEditing(false);
            Alert.alert("Success", "Your profile has been updated.");
        } catch (error) {
            Alert.alert(
                "Error",
                error instanceof Error ? error.message : String(error)
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView className="bg-white h-full px-5 pt-5">
            <View className="flex-1 pb-28">
                <CustomHeader title="Profile" />

                <View className="flex items-center my-5">
                    <View className="profile-avatar">
                        <Image
                            source={user?.avatar ? { uri: user.avatar } : images.avatar}
                            className="size-28 rounded-full"
                            resizeMode="cover"
                        />
                        <TouchableOpacity
                            className="profile-edit"
                            onPress={handleAvatarPress}
                            disabled={isUploadingAvatar}
                        >
                            {isUploadingAvatar ? (
                                <Text className="small-bold text-white">…</Text>
                            ) : (
                                <Image source={images.pencil} className="size-3.5" resizeMode="contain" tintColor="#ffffff" />
                            )}
                        </TouchableOpacity>
                    </View>
                    <Text className="h1-bold text-dark-100 mt-4">{user?.name}</Text>
                    <Text className="body-medium text-gray-200 mt-1">{user?.email}</Text>
                    {isUploadingAvatar && (
                        <Text className="body-regular text-primary mt-1">
                            Uploading photo...
                        </Text>
                    )}
                </View>

                <View className="mt-5">
                    {isEditing ? (
                        <>
                            <EditField
                                label="Full Name"
                                value={name}
                                icon={images.user}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                            <EditField
                                label="Email"
                                value={email}
                                icon={images.envelope}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                            />
                            <EditField
                                label="Current Password (required to change email)"
                                value={password}
                                icon={images.person}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </>
                    ) : (
                        <>
                            <ProfileField
                                label="Full Name"
                                value={user?.name ?? "—"}
                                icon={images.user}
                            />
                            <ProfileField
                                label="Email"
                                value={user?.email ?? "—"}
                                icon={images.envelope}
                            />
                            <ProfileField
                                label="Member Since"
                                value={memberSince}
                                icon={images.clock}
                            />
                        </>
                    )}
                </View>

                {isEditing && (
                    <View className="flex-row gap-4 mt-6">
                        <TouchableOpacity
                            className="flex-1 items-center justify-center rounded-full border border-gray-200 p-3"
                            onPress={() => {
                                setIsEditing(false);
                                setName(user?.name ?? "");
                                setEmail(user?.email ?? "");
                                setPassword("");
                            }}
                            disabled={isSaving}
                        >
                            <Text className="paragraph-semibold text-gray-200">
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <View className="flex-1">
                            <CustomButton
                                title="Save"
                                isLoading={isSaving}
                                onPress={handleSave}
                            />
                        </View>
                    </View>
                )}

                {!isEditing && (
                    <>
                        <View className="mt-6">
                            <TouchableOpacity
                                className="profile-field"
                                onPress={() => router.push("/orders")}
                            >
                                <View className="profile-field__icon">
                                    <Image source={images.bag} className="size-5" resizeMode="contain" tintColor={colors.primary} />
                                </View>
                                <View className="flex-1">
                                    <Text className="paragraph-bold text-dark-100">
                                        My Orders
                                    </Text>
                                </View>
                                <Image source={images.arrowRight} className="size-5" resizeMode="contain" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="profile-field"
                                onPress={() => router.push("/favorites")}
                            >
                                <View className="profile-field__icon">
                                    <Image source={images.star} className="size-5" resizeMode="contain" tintColor={colors.primary} />
                                </View>
                                <View className="flex-1">
                                    <Text className="paragraph-bold text-dark-100">
                                        My Favorites
                                    </Text>
                                </View>
                                <Image source={images.arrowRight} className="size-5" resizeMode="contain" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            className="flex-row items-center justify-center gap-2 mt-6 border border-gray-200 rounded-full p-3"
                            onPress={() => setIsEditing(true)}
                        >
                            <Image source={images.pencil} className="size-4" resizeMode="contain" tintColor={colors.primary} />
                            <Text className="paragraph-semibold text-primary">
                                Edit Profile
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-1 justify-end">
                            <CustomButton
                                title="Sign Out"
                                onPress={handleSignOut}
                                leftIcon={
                                    <Image source={images.logout} className="size-5 mr-2" resizeMode="contain" tintColor="#ffffff" />
                                }
                            />
                        </View>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

export default Profile;
