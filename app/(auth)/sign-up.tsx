import CustomButton from "@/components/customButton";
import CustomInput from "@/components/customInput";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

const SignUP = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [form, setForm] = useState({name: '', email: '', password: ''});
	const submit = async () => {
		if(!form.name || !form.email || !form.password) Alert.alert('Error', 'Please Enter Valid Email Address & Password');{
			setIsSubmitting(true);
			try {
				//! Appwrite Sign Up Logic
				Alert.alert('Success', 'You have successfully signed in!');
				router.replace('/');
			} catch (error : any) {
				Alert.alert('Error', 'Failed to sign in. Please try again.');
			} finally {
				setIsSubmitting(false);
			}
		}
	}
	return (
		<View className="gap-10 bg-white rounded-lg p-5 mt-5">
			<CustomInput
				placeholder="Fullname"
				value={form.name}
				onChangeText={(text) => setForm((prev) =>({...form, name: text}))}
				label="Enter Your Fullname"
				keyboardType="default"
				/>
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
						Already have an account?
						<Link href="/sign-in" className="base-bold text-primary ml-2">Sign In</Link>
					</Text>
				</View>	
		</View>
	);
};

export default SignUP;
