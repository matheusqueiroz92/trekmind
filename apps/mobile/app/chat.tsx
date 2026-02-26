import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, FlatList } from "react-native";
import { Link } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type Message = { role: "user" | "assistant"; content: string };

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  async function send() {
    if (!message.trim() || loading) return;
    const userMessage = message.trim();
    setMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    try {
      const body: { message: string; latitude?: number; longitude?: number } = {
        message: userMessage,
      };
      if (location) {
        body.latitude = location.lat;
        body.longitude = location.lng;
      }
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.ok ? (data.answer ?? "") : (data.error ?? "Erro"),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erro de conexão." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href="/" asChild>
          <Text style={styles.link}>Voltar</Text>
        </Link>
        <Text style={styles.title}>Assistente de viagens</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View
            style={
              item.role === "user"
                ? styles.userBubble
                : styles.assistantBubble
            }
          >
            <Text
              style={
                item.role === "user"
                  ? styles.userText
                  : styles.assistantText
              }
            >
              {item.content}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.placeholder}>
            Pergunte sobre destinos, restaurantes ou onde se hospedar.
          </Text>
        }
      />
      {loading && (
        <View style={styles.assistantBubble}>
          <Text style={styles.assistantText}>Pensando...</Text>
        </View>
      )}
      <View style={styles.footer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Sua pergunta..."
          editable={!loading}
        />
        <Pressable
          style={[styles.sendButton, (!message.trim() || loading) && styles.sendDisabled]}
          onPress={send}
          disabled={!message.trim() || loading}
        >
          <Text style={styles.sendText}>Enviar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", backgroundColor: "#fff" },
  link: { color: "#059669" },
  title: { fontSize: 18, fontWeight: "bold", color: "#1e293b", marginTop: 8 },
  placeholder: { color: "#94a3b8", textAlign: "center", padding: 24 },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#059669", margin: 8, padding: 12, borderRadius: 12, maxWidth: "80%" },
  assistantBubble: { alignSelf: "flex-start", backgroundColor: "#fff", margin: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", maxWidth: "80%" },
  userText: { color: "#fff" },
  assistantText: { color: "#1e293b" },
  footer: { flexDirection: "row", padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: "#e2e8f0", backgroundColor: "#fff" },
  input: { flex: 1, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 12, backgroundColor: "#fff" },
  sendButton: { backgroundColor: "#059669", paddingHorizontal: 20, justifyContent: "center", borderRadius: 8 },
  sendDisabled: { opacity: 0.5 },
  sendText: { color: "#fff", fontWeight: "600" },
});
