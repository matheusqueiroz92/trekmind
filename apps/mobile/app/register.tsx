import { useState } from "react";
import { View, TextInput, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Link, useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister() {
    if (!name || !email) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: password || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Erro", data.error ?? "Falha no cadastro");
        return;
      }
      router.replace("/login");
    } catch {
      Alert.alert("Erro", "Sem conexão. Verifique a URL da API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nome" />
      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Senha (mín. 8)"
        secureTextEntry
      />
      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Cadastrando..." : "Cadastrar"}</Text>
      </Pressable>
      <Link href="/login" asChild>
        <Pressable>
          <Text style={styles.link}>Já tem conta? Entrar</Text>
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
