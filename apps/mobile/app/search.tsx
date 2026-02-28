import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import * as Location from "expo-location";
import { authHeaders } from "../lib/auth-token";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export default function Search() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function searchPlaces() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(
        `${API_URL}/api/places/search?q=${encodeURIComponent(query.trim())}&lang=pt`,
        { headers }
      );
      if (!res.ok) throw new Error("Busca falhou");
      router.push({ pathname: "/places", params: { q: query.trim() } });
    } catch {
      Alert.alert("Erro", "Não foi possível buscar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function requestMyLocation() {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão", "Ative a localização para usar esta função.");
        setLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = pos.coords;
      const headers = await authHeaders();
      const res = await fetch(
        `${API_URL}/api/places/nearby?lat=${latitude}&lng=${longitude}&radius=15`,
        { headers }
      );
      if (!res.ok) throw new Error("Falha ao buscar");
      router.push({
        pathname: "/places",
        params: { lat: String(latitude), lng: String(longitude) },
      });
    } catch {
      Alert.alert("Erro", "Não foi possível obter localização ou buscar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Cidade ou ponto de interesse"
        editable={!loading}
      />
      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={searchPlaces}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Buscando..." : "Buscar"}</Text>
      </Pressable>
      <Pressable
        style={[styles.outlineButton, loading && styles.buttonDisabled]}
        onPress={requestMyLocation}
        disabled={loading}
      >
        <Text style={styles.outlineButtonText}>Usar minha localização</Text>
      </Pressable>
      <Link href="/" asChild>
        <Pressable>
          <Text style={styles.link}>Voltar</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#f8fafc" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: { backgroundColor: "#059669", padding: 14, borderRadius: 8, alignItems: "center", marginBottom: 12 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "600" },
  outlineButton: { borderWidth: 1, borderColor: "#059669", padding: 14, borderRadius: 8, alignItems: "center", marginBottom: 12 },
  outlineButtonText: { color: "#059669", fontWeight: "600" },
  link: { color: "#059669", marginTop: 16 },
});
