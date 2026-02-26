import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Link } from "expo-router";

export default function Places() {
  const { data } = useLocalSearchParams<{ data?: string }>();
  const places = (() => {
    if (!data) return [];
    try {
      return JSON.parse(data) as Array<{
        id: string;
        name: string;
        description?: string;
        category: string;
      }>;
    } catch {
      return [];
    }
  })();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lugares encontrados</Text>
      {places.length === 0 ? (
        <Text style={styles.empty}>Nenhum lugar encontrado.</Text>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.category}>{item.category}</Text>
              {item.description ? (
                <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
              ) : null}
            </View>
          )}
        />
      )}
      <Link href="/search" asChild>
        <Text style={styles.link}>Nova busca</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#f8fafc" },
  title: { fontSize: 20, fontWeight: "bold", color: "#1e293b", marginBottom: 16 },
  empty: { color: "#64748b" },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  name: { fontWeight: "600", color: "#1e293b" },
  category: { fontSize: 12, color: "#64748b", textTransform: "capitalize", marginTop: 4 },
  desc: { fontSize: 14, color: "#475569", marginTop: 8 },
  link: { color: "#059669", marginTop: 16 },
});
