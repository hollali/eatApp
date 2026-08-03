import CustomButton from "@/components/customButton";
import CustomInput from "@/components/customInput";
import { recoverPassword } from "@/lib/appwrite";
import * as Linking from "expo-linking";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

const ForgotPassword = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [email, setEmail] = useState("");

	const submit = async () => {
		if (!email.trim()) {
			return Alert.alert("Error", "Please enter your email address");
		}

		setIsSubmitting(true);
		try {
			const redirectUrl = Linking.createURL("reset-password");
			await recoverPassword({ email: email.trim(), redirectUrl });
			Alert.alert(
				"Reset Link Sent",
				"Check your email for a link to reset your password.",
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
				<Text className="h3-bold text-dark-100 mb-2">Forgot Password?</Text>
				<Text className="body-regular text-gray-200">
					Enter your email address and we&#39;ll send you a link to reset your password.
				</Text>
			</View>
			<CustomInput
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				label="Enter Your Email Address"
				keyboardType="email-address"
			/>
			<CustomButton
				title="Send Reset Link"
				isLoading={isSubmitting}
				onPress={submit}
			/>
			<View className="flex justify-center mt-5 flex-row gap-2">
				<Text className="base-regular text-gray-100">
					Remembered your password?
					<Link href="/sign-in" className="base-bold text-primary ml-2">
						Sign In
					</Link>
				</Text>
			</View>
		</View>
	);
};

export default ForgotPassword;
