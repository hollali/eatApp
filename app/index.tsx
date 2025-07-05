import { images, offers } from "@/constants";
import cn from 'clsx';
import { Fragment } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "./globals.css";

export default function Index() {
	return (
		<SafeAreaView>
      <FlatList data={offers}
      renderItem={({item,index}) =>{
        const isEven = index % 2 === 0;
        return (
          <View>
            <Pressable className={cn("offer-card", isEven ? 'flex-row-reverse':'flex-row')} style={{backgroundColor: item.color}}>
              {({pressed}) => (
                <Fragment>
                  <View className={"h-full w-1/2"}>
                  <Image source={item.image} className={"size-full"} resizeMode={"contain"} />
                  </View>
                  <View className={"offer-card__info"}>
                    <Text className={" h1-bold text-white loading-tight"}>{item.title}</Text>
                    <Image source={images.arrowRight} className="size-10" resizeMode="contain" tintColor="#ffffff"/>
                  </View>
                </Fragment>
              )}
            </Pressable>
          </View>
        )
      }}/>
    </SafeAreaView>
	);
}
