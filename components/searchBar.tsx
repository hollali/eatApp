import {colors, images} from "@/constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Image, TextInput, TouchableOpacity, View } from "react-native";
import { useDebouncedCallback } from "use-debounce";

const Searchbar = () => {
    const params = useLocalSearchParams<{ query: string }>();
    const [query, setQuery] = useState(params.query ?? "");

    const updateParams = (text: string) => {
        if (text) router.setParams({ query: text });
        else router.setParams({ query: undefined });
    };

    const debouncedUpdate = useDebouncedCallback(updateParams, 300);

    const handleSearch = (text: string) => {
        setQuery(text);
        debouncedUpdate(text);
    };

    const handleSubmit = () => {
        debouncedUpdate.cancel();
        updateParams(query.trim());
    };

    return (
        <View className="searchbar">
            <TextInput
                className="flex-1 p-5"
                placeholder="Search for pizzas, burgers..."
                value={query}
                onChangeText={handleSearch}
                onSubmitEditing={handleSubmit}
                placeholderTextColor="#A0A0A0"
                returnKeyType="search"
            />
            <TouchableOpacity
                className="pr-5"
                onPress={handleSubmit}
            >
                <Image
                    source={images.search}
                    className="size-6"
                    resizeMode="contain"
                    tintColor={colors.secondary}
                />
            </TouchableOpacity>
        </View>
    );
};

export default Searchbar;
