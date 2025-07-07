import CustomButton from "@/components/customButton";
import CustomInput from "@/components/customInput";
import { signIn } from "@/lib/appwrite";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import * as Sentry from '@sentry/react-native';

const SignIn = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [form, setForm] = useState({email: '', password: ''});
	const submit = async () => {
		const { email, password } = form;
		if(!email || !password) return Alert.alert('Error', 'Please Enter Valid Email Address & Password');{
			setIsSubmitting(true);
			try {
				//! Appwrite Sign In Logic
				await signIn({email, password});
				router.replace('/');
			} catch (error : any) {
				Alert.alert('Error', error.message);
				Sentry.captureEvent(error);
			} finally {
				setIsSubmitting(false);
			}
		}
	}
	return (
		<View className="gap-10 bg-white rounded-lg p-5 mt-5">
			<CustomInput
				placeholder="Email"
				value={form.email}
				onChangeText={(text) => setForm((prev) =>({...form, email: text}))}
				label="Enter Your Email Address"
				keyboardType="email-address"
				/>
				<CustomInput
				placeholder="Password"
				value={form.password}
				onChangeText={(text) => setForm((prev) =>({...form, password: text}))}
				label="Enter Your Password"
				secureTextEntry={true}
				/>
				<CustomButton
				title="Sign In"
				isLoading={isSubmitting}
				onPress={submit}
				/>
				<View className="flex justify-center mt-5 flex-row gap-2">
					<Text className="base-regular text-gray-100">
						Don&#39;t have an account?
						<Link href="/sign-up" className="base-bold text-primary ml-2">Sign Up</Link>
					</Text>
				</View>	
		</View>
	);
};

export default SignIn;
