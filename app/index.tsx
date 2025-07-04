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
            <Pressable className="bg-amber-600 rounded-lg p-4 m-2">
              <Text>{item.title}</Text>
            </Pressable>
          </View>
        )
      }}/>
    </SafeAreaView>
	);
}
