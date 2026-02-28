/**
 * Mensagens de erro centralizadas (equivalente ao API_ERROR_MESSAGES do web).
 * Usar nas telas para exibir erros da API ou de rede de forma consistente.
 */
export const ERROR_MESSAGES = {
  /** Fallback quando a API retorna erro sem mensagem */
  LOGIN_FAILED: "Não foi possível entrar. Verifique e-mail e senha.",
  REGISTER_FAILED: "Não foi possível criar sua conta. Tente novamente.",
  /** Rede / conexão */
  NETWORK: "Sem conexão. Verifique a URL da API e sua internet.",
  /** Chat */
  CHAT_FAILED: "Não foi possível processar sua pergunta. Tente novamente.",
  /** Sessão */
  UNAUTHORIZED: "Sessão inválida ou expirada. Faça login novamente.",
} as const;

/** Retorna a mensagem de erro da API ou um fallback. */
export function apiErrorMessage(
  data: { error?: string } | null,
  fallback: string
): string {
  const msg = data?.error?.trim();
  return msg && msg.length > 0 ? msg : fallback;
}
