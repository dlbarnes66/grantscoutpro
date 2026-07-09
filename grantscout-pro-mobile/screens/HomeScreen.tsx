import { View, Text, Button } from "react-native";

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>GrantScout Pro Mobile</Text>
      <Button
        title="Search Grants"
        onPress={() => navigation.navigate("Search")}
      />
    </View>
  );
}
