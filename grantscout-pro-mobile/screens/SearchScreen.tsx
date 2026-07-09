import { useState } from "react";
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity } from "react-native";

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  async function search() {
    const res = await fetch("https://your-api.com/api/grants/search", {
      method: "POST",
      body: JSON.stringify({
        query,
        filters: {},
        tier: "ENTERPRISE",
      }),
    });

    const data = await res.json();
    setResults(data.results || []);
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Search Grants</Text>

      <TextInput
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 20,
          borderRadius: 8,
        }}
        placeholder="Search grants..."
        value={query}
        onChangeText={setQuery}
      />

      <Button title="Search" onPress={search} />

      {results.map((g) => (
        <TouchableOpacity
          key={g.id}
          onPress={() => navigation.navigate("Detail", { id: g.id })}
          style={{
            marginTop: 20,
            padding: 15,
            borderWidth: 1,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>{g.title}</Text>
          <Text>{g.source}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
