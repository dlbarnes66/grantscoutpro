import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";

export default function DetailScreen({ route }: any) {
  const { id } = route.params;
  const [grant, setGrant] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("https://your-api.com/api/grants/detail", {
        method: "POST",
        body: JSON.stringify({
          grantId: id,
          tier: "ENTERPRISE",
        }),
      });

      const data = await res.json();
      setGrant(data.grant);
    }

    load();
  }, [id]);

  if (!grant) return <Text>Loading…</Text>;

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>{grant.title}</Text>
      <Text style={{ marginTop: 10 }}>{grant.summary}</Text>

      <Text style={{ marginTop: 20, fontWeight: "bold" }}>Agency</Text>
      <Text>{grant.agency}</Text>

      <Text style={{ marginTop: 20, fontWeight: "bold" }}>Category</Text>
      <Text>{grant.category}</Text>

      <Text style={{ marginTop: 20, fontWeight: "bold" }}>AI Scores</Text>
      <Text>Eligibility: {grant.ai?.eligibilityScore}</Text>
      <Text>Alignment: {grant.ai?.alignmentScore}</Text>
      <Text>Readiness: {grant.ai?.readinessScore}</Text>
    </ScrollView>
  );
}
