import CartButton from "@/components/cartButton";
import { images, offers } from "@/constants";
import useAuthStore from "@/store/auth.store";
import cn from 'clsx';
import * as Location from "expo-location";
import { Fragment, useEffect, useState } from "react";
import { FlatList, Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Index() {
  const {user} = useAuthStore();

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
  
	return (
		<SafeAreaView className="flex-1 bg-white">
      <FlatList data={offers}
      renderItem={({item,index}) =>{
        const isEven = index % 2 === 0;
        return (
          <View>
            <Pressable className={cn("offer-card", isEven ? 'flex-row-reverse':'flex-row')} style={{backgroundColor: item.color}}
            android_ripple={{color: '#ffffff22'}}>
              {({pressed}) => (
                <Fragment>
                  <View className={"h-full w-1/2"}>
                  <Image source={item.image} className={"size-full"} resizeMode={"contain"} />
                  </View>
                  <View className={cn("offer-card__info", isEven  ? 'pl-10' : 'pr-10')}>
                    <Text className={" h1-bold text-white loading-tight"}>{item.title}</Text>
                    <Image source={images.arrowRight} className="size-10" resizeMode="contain" tintColor="#ffffff"/>
                  </View>
                </Fragment>
              )}
            </Pressable>
          </View>
        )
      }}
      contentContainerClassName="pb-28 px-5"
      ListHeaderComponent={() => (
        <View className="flex-between flex-row w-full my-5">
        <View className="flex-start">
          <Text className="small-bold text-primary">DELIVER TO</Text>
          <TouchableOpacity className="flex-center flex-row gap-x-1 mt-0.5">
            <Text className="paragraph-bold text-dark-100">{city}</Text>
            <Image source={images.arrowDown} className="size-3" resizeMode="contain" tintColor="#000000"/>
          </TouchableOpacity>
        </View>
        <CartButton/>
      </View>
      )}
      />
    </SafeAreaView>
	);
}
