import CartButton from "@/components/cartButton";
import MenuCard from "@/components/menuCard";
import { images, offers } from "@/constants";
import { getCategories, getMenu } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import useAuthStore from "@/store/auth.store";
import { Category, MenuItem } from "@/type";
import cn from 'clsx';
import * as Location from "expo-location";
import { router } from "expo-router";
import { Fragment, useEffect, useState } from "react";
import { FlatList, Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { user } = useAuthStore();
  const { data: categories } = useAppwrite({ fn: getCategories });
  const { data: popular } = useAppwrite({ fn: getMenu, params: { limit: 6 } });

  const [city, setCity] = useState("Fetching Location....");

  useEffect(() => {
    (async () => {
      // Request permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCity("Permission denied");
        return;
      }

      // Get user's coordinates
      let location = await Location.getCurrentPositionAsync({});
      
      // Reverse geocode to get city
      let [place] = await Location.reverseGeocodeAsync(location.coords);

      if (place?.city) {
        setCity(place.city);
      } else {
        setCity("Unknown");
      }
    })();
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const categoryList = (categories as Category[] | null) ?? [];
  const popularItems = (popular as MenuItem[] | null) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={offers}
        renderItem={({ item, index }) => {
          const isEven = index % 2 === 0;
          return (
            <Pressable
              className={cn("offer-card", isEven ? 'flex-row-reverse':'flex-row')}
              style={{ backgroundColor: item.color }}
              android_ripple={{ color: '#ffffff22' }}
              onPress={() => router.push({ pathname: "/search", params: { category: "all" } })}
            >
              {({ pressed }) => (
                <Fragment>
                  <View className={"h-full w-1/2"}>
                    <Image source={item.image} className={"size-full"} resizeMode={"contain"} />
                  </View>
                  <View className={cn("offer-card__info", isEven ? 'pl-10' : 'pr-10')}>
                    <Text className={"h1-bold text-white loading-tight"}>{item.title}</Text>
                    <Image source={images.arrowRight} className="size-10" resizeMode="contain" tintColor="#ffffff"/>
                  </View>
                </Fragment>
              )}
            </Pressable>
          );
        }}
        contentContainerClassName="pb-28 px-5"
        ListHeaderComponent={() => (
          <View>
            <View className="flex-row w-full my-5">
              <View className="flex-1">
                <Text className="small-bold text-primary">DELIVER TO</Text>
                <TouchableOpacity className="flex-row items-center gap-x-1 mt-0.5">
                  <Text className="paragraph-bold text-dark-100">{city}</Text>
                  <Image source={images.arrowDown} className="size-3" resizeMode="contain" tintColor="#000000"/>
                </TouchableOpacity>
              </View>
              <CartButton/>
            </View>

            <View className="mb-5">
              <Text className="h1-bold text-dark-100">Hi, {firstName}</Text>
              <Text className="body-regular text-gray-200 mt-1">
                What would you like to eat today?
              </Text>
            </View>

            {categoryList.length > 0 && (
              <FlatList
                data={categoryList}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-x-2 pb-3"
                className="mb-2"
                keyExtractor={(item) => item.$id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="filter bg-white"
                    onPress={() => router.push({ pathname: "/search", params: { category: item.$id } })}
                  >
                    <Text className="body-medium text-gray-200">{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {popularItems.length > 0 && (
              <View className="my-4">
                <Text className="h3-bold text-dark-100 mb-4">Popular Near You</Text>
                <FlatList
                  data={popularItems}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-7 pb-4"
                  keyExtractor={(item) => item.$id}
                  renderItem={({ item }) => (
                    <View className="w-40">
                      <MenuCard item={item} />
                    </View>
                  )}
                />
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
