import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { authHeaders } from "../lib/auth-token";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type PlaceItem = {
  id: string;
  name: string;
  description?: string;
  category: string;
  latitude: number;
  longitude: number;
  url?: string;
  imageUrl?: string;
  wikipediaTitle?: string;
};

export default function Places() {
  const { q, lat, lng } = useLocalSearchParams<{
    q?: string;
    lat?: string;
    lng?: string;
  }>();
  const router = useRouter();
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await authHeaders();
      if (q) {
        const res = await fetch(
          `${API_URL}/api/places/search?q=${encodeURIComponent(q)}&lang=pt`,
          { headers }
        );
        if (!res.ok) {
          setError("Não foi possível buscar.");
          setPlaces([]);
          return;
        }
        const data = await res.json();
        setPlaces(Array.isArray(data) ? data : []);
      } else if (lat != null && lng != null) {
        const res = await fetch(
          `${API_URL}/api/places/nearby?lat=${lat}&lng=${lng}&radius=15&lang=pt`,
          { headers }
        );
        if (!res.ok) {
          setError("Não foi possível buscar lugares próximos.");
          setPlaces([]);
          return;
        }
        const data = await res.json();
        setPlaces(Array.isArray(data) ? data : []);
      } else {
        setPlaces([]);
      }
    } catch {
      setError("Erro de conexão.");
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [q, lat, lng]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const hasParams = q || (lat != null && lng != null);

  function openDetail(place: PlaceItem) {
    const title = place.wikipediaTitle ?? place.name;
    router.push({
      pathname: "/place-detail",
      params: { title: encodeURIComponent(title) },
    });
  }

  if (!hasParams) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Lugares encontrados</Text>
        <Text style={styles.empty}>
          Use a busca ou sua localização para encontrar lugares.
        </Text>
        <Link href="/search" asChild>
          <Pressable>
            <Text style={styles.link}>Nova busca</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Buscando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lugares encontrados</Text>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : places.length === 0 ? (
        <Text style={styles.empty}>Nenhum lugar encontrado.</Text>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() => openDetail(item)}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.thumb}
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <View style={styles.thumbPlaceholder} />
              )}
              <View style={styles.cardContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.category}>{item.category}</Text>
                {item.description ? (
                  <Text style={styles.desc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <Text style={styles.verMais}>Ver mais →</Text>
              </View>
            </Pressable>
          )}
        />
      )}
      <Link href="/search" asChild>
        <Pressable>
          <Text style={styles.link}>Nova busca</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#f8fafc" },
  centered: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#64748b" },
  title: { fontSize: 20, fontWeight: "bold", color: "#1e293b", marginBottom: 16 },
  empty: { color: "#64748b", marginBottom: 16 },
  error: { color: "#dc2626", marginBottom: 16 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  cardPressed: { opacity: 0.9 },
  thumb: { width: 72, height: 72, borderRadius: 8, marginRight: 12 },
  thumbPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#e2e8f0",
  },
  cardContent: { flex: 1, minWidth: 0 },
  name: { fontWeight: "600", color: "#1e293b" },
  category: { fontSize: 12, color: "#64748b", textTransform: "capitalize", marginTop: 4 },
  desc: { fontSize: 14, color: "#475569", marginTop: 8 },
  verMais: { fontSize: 14, color: "#059669", fontWeight: "600", marginTop: 4 },
  link: { color: "#059669", marginTop: 16 },
});
