import { FlatList, Pressable, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "./globals.css";
import { offers } from "@/constants";

export default function Index() {
	return (
		<SafeAreaView>
      <FlatList data={offers}
      renderItem={({item,index}) =>{
        return (
          <View>
            <Pressable className="bg-amber-600 rounded-xl my-3 h-48">
              <Text>{item.title}</Text>
            </Pressable>
          </View>
        )
      }}/>
    </SafeAreaView>
	);
}
