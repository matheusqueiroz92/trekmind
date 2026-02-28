import { useState } from "react";
import { View, TextInput, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import { setToken } from "../lib/auth-token";
import { ERROR_MESSAGES, apiErrorMessage } from "../lib/error-messages";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok) {
        Alert.alert("Erro", apiErrorMessage(data, ERROR_MESSAGES.LOGIN_FAILED));
        return;
      }
      if (data.token) {
        await setToken(data.token);
        router.replace("/");
      }
    } catch {
      Alert.alert("Erro", ERROR_MESSAGES.NETWORK);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Entrando..." : "Entrar"}</Text>
      </Pressable>
      <Link href="/register" asChild>
        <Pressable>
          <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#f8fafc", justifyContent: "center" },
  label: { fontSize: 14, fontWeight: "500", color: "#334155", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: { backgroundColor: "#059669", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "600" },
  link: { color: "#059669", marginTop: 16, textAlign: "center" },
});
