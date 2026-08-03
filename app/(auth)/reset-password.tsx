import CustomButton from "@/components/customButton";
import CustomInput from "@/components/customInput";
import { resetPassword } from "@/lib/appwrite";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

const ResetPassword = () => {
	const { userId, secret } = useLocalSearchParams<{ userId?: string; secret?: string }>();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [form, setForm] = useState({ password: "", confirmPassword: "" });

	const submit = async () => {
		const { password, confirmPassword } = form;
		if (!password || !confirmPassword) {
			return Alert.alert("Error", "Please enter and confirm your new password");
		}
		if (password !== confirmPassword) {
			return Alert.alert("Error", "Passwords do not match");
		}
		if (!userId || !secret) {
			return Alert.alert("Error", "Invalid or expired reset link");
		}

		setIsSubmitting(true);
		try {
			await resetPassword({ userId, secret, password });
			Alert.alert(
				"Password Updated",
				"Your password has been reset successfully. Please sign in.",
				[{ text: "OK", onPress: () => router.replace("/sign-in") }]
			);
		} catch (error) {
			Alert.alert("Error", error instanceof Error ? error.message : String(error));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<View className="gap-10 bg-white rounded-lg p-5 mt-5">
			<View>
				<Text className="h3-bold text-dark-100 mb-2">Set a New Password</Text>
				<Text className="body-regular text-gray-200">
					Choose a new password for your account.
				</Text>
			</View>
			<CustomInput
				placeholder="New Password"
				value={form.password}
				onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
				label="Enter Your New Password"
				secureTextEntry={true}
			/>
			<CustomInput
				placeholder="Confirm Password"
				value={form.confirmPassword}
				onChangeText={(text) => setForm((prev) => ({ ...prev, confirmPassword: text }))}
				label="Confirm Your New Password"
				secureTextEntry={true}
			/>
			<CustomButton
				title="Reset Password"
				isLoading={isSubmitting}
				onPress={submit}
			/>
		</View>
	);
};

export default ResetPassword;
