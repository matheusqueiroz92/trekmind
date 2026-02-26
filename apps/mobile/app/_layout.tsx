import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "TrekMind" }} />
      <Stack.Screen name="login" options={{ title: "Entrar" }} />
      <Stack.Screen name="register" options={{ title: "Cadastrar" }} />
      <Stack.Screen name="search" options={{ title: "Buscar" }} />
      <Stack.Screen name="chat" options={{ title: "Assistente" }} />
      <Stack.Screen name="places" options={{ title: "Lugares" }} />
    </Stack>
  );
}
