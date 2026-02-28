import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { authHeaders } from "../lib/auth-token";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type PlaceDetails = {
  title: string;
  extract: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  latitude?: number;
  longitude?: number;
};

function buildMapsUrl(title: string, lat?: number, lng?: number): string {
  if (lat != null && lng != null) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(title)}`;
}

export default function PlaceDetail() {
  const { title: titleParam } = useLocalSearchParams<{ title?: string }>();
  const router = useRouter();
  const title = titleParam ? decodeURIComponent(titleParam) : "";
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!title) {
      setError("Título não informado.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    authHeaders()
      .then((headers) =>
        fetch(
          `${API_URL}/api/places/details?title=${encodeURIComponent(title)}&lang=pt`,
          { headers }
        )
      )
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar");
        return res.json();
      })
      .then((data: PlaceDetails) => {
        if (!cancelled) setDetails(data);
      })
      .catch(() => {
        if (!cancelled) setError("Não foi possível carregar os detalhes.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [title]);

  if (!title) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Título não informado.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (error || !details) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error ?? "Detalhes não encontrados."}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const mapsUrl = buildMapsUrl(details.title, details.latitude, details.longitude);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{details.title}</Text>
      {details.thumbnailUrl ? (
        <Image
          source={{ uri: details.thumbnailUrl }}
          style={styles.image}
          accessibilityIgnoresInvertColors
        />
      ) : null}
      {details.description ? (
        <Text style={styles.description}>{details.description}</Text>
      ) : null}
      <Text style={styles.extract}>{details.extract}</Text>
      <View style={styles.actions}>
        <Pressable
          style={styles.buttonSecondary}
          onPress={() => Linking.openURL(details.url)}
        >
          <Text style={styles.buttonSecondaryText}>Ver na Wikipedia</Text>
        </Pressable>
        <Pressable
          style={styles.buttonInstagram}
          onPress={() =>
            Linking.openURL(
              `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(details.title)}`
            )
          }
        >
          <Text style={styles.buttonInstagramText}>Ver no Instagram</Text>
        </Pressable>
        <Pressable
          style={styles.buttonPrimary}
          onPress={() => Linking.openURL(mapsUrl)}
        >
          <Text style={styles.buttonPrimaryText}>Ver no mapa</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.link}>← Voltar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 24, paddingBottom: 48 },
  centered: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#64748b" },
  title: { fontSize: 22, fontWeight: "bold", color: "#1e293b", marginBottom: 16 },
  image: { width: "100%", height: 200, borderRadius: 8, marginBottom: 16 },
  description: { fontSize: 14, color: "#64748b", marginBottom: 8 },
  extract: { fontSize: 16, color: "#334155", lineHeight: 24, marginBottom: 24 },
  actions: { gap: 12, marginBottom: 24 },
  buttonSecondary: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
  },
  buttonSecondaryText: { color: "#334155", fontWeight: "600" },
  buttonInstagram: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#E1306C",
    alignItems: "center",
  },
  buttonInstagramText: { color: "#fff", fontWeight: "600" },
  buttonPrimary: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#059669",
    alignItems: "center",
  },
  buttonPrimaryText: { color: "#fff", fontWeight: "600" },
  error: { color: "#dc2626", marginBottom: 16 },
  back: { alignSelf: "flex-start" },
  link: { color: "#059669", fontWeight: "600" },
});
