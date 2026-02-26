import { View, Text, StyleSheet, Pressable } from "react-native";
import { Link } from "expo-router";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TrekMind</Text>
      <Text style={styles.subtitle}>Guia turístico inteligente</Text>
      <Link href="/search" asChild>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Buscar destinos</Text>
        </Pressable>
      </Link>
      <Link href="/login" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Entrar</Text>
        </Pressable>
      </Link>
      <Link href="/register" asChild>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Cadastrar</Text>
        </Pressable>
      </Link>
      <Link href="/chat" asChild>
        <Pressable>
          <Text style={styles.link}>Conversar com o assistente</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: "#334155",
    fontWeight: "500",
  },
  link: {
    color: "#059669",
    marginTop: 24,
    fontWeight: "500",
  },
});
