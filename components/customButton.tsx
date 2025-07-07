import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";
import { CustomButtonProps } from "@/type";
import cn from "clsx";

const CustomButton = ({
    title = "Click Me",
    onPress,
    style,
    textStyle,
    leftIcon,
    isLoading = false,
}:CustomButtonProps) => {
	return (
		<TouchableOpacity className={cn("custom-button", style)} onPress={onPress}>
            {leftIcon}
            <View className="flex-center flex-row">
                {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                ):(
                    <Text className={cn("text-white-100 paragraph-semibold", textStyle)}>{title}</Text>
                )}
            </View>
		</TouchableOpacity>
	);
};

export default CustomButton;
