import { NextResponse } from "next/server";

/**
 * Formato padrão de erro nas respostas da API.
 * Evita expor detalhes internos e mantém mensagens em português para o usuário.
 */
export interface ApiErrorBody {
  error: string;
  code?: string;
}

/** Mensagens amigáveis por contexto (não expõem stack nem detalhes técnicos). */
export const API_ERROR_MESSAGES = {
  /** Requisição inválida (400) */
  BAD_REQUEST: "Requisição inválida. Verifique os dados enviados.",
  /** Parâmetros obrigatórios faltando */
  MISSING_PARAMS: "Informe os dados obrigatórios.",
  /** Não autorizado (401) */
  UNAUTHORIZED: "Sessão inválida ou expirada. Faça login novamente.",
  /** Erro interno (500) – mensagem genérica para o cliente */
  INTERNAL: "Ocorreu um erro. Tente novamente em alguns instantes.",
  /** Chat */
  CHAT_MESSAGE_REQUIRED: "Envie uma mensagem.",
  CHAT_FAILED: "Não foi possível processar sua pergunta. Tente novamente.",
  /** Busca de lugares */
  SEARCH_QUERY_REQUIRED: "Digite o que deseja buscar (cidade, endereço ou ponto de interesse).",
  SEARCH_FAILED: "Não foi possível buscar os lugares. Tente novamente.",
  /** Lugares próximos */
  NEARBY_COORDS_REQUIRED: "É necessário informar latitude e longitude.",
  NEARBY_FAILED: "Não foi possível buscar lugares próximos. Tente novamente.",
  /** Auth (fallback quando Better Auth não retorna mensagem) */
  AUTH_LOGIN_FAILED: "Não foi possível entrar. Verifique e-mail e senha.",
  AUTH_REGISTER_FAILED: "Não foi possível criar sua conta. Tente novamente.",
  AUTH_MAGIC_LINK_FAILED: "Não foi possível enviar o link por e-mail. Tente novamente.",
  /** Rede */
  NETWORK_ERROR: "Verifique sua conexão e tente novamente.",
} as const;

/**
 * Gera uma NextResponse de erro no formato padrão da API.
 */
export function apiErrorResponse(
  message: string,
  status: number = 500,
  code?: string
): NextResponse {
  const body: ApiErrorBody = { error: message };
  if (code) body.code = code;
  return NextResponse.json(body, { status });
}

/**
 * Trata exceções nas rotas da API: loga o erro real (para diagnóstico)
 * e retorna resposta com mensagem segura para o cliente.
 */
export function handleRouteError(
  err: unknown,
  userMessage: string = API_ERROR_MESSAGES.INTERNAL
): NextResponse {
  if (process.env.NODE_ENV !== "test") {
    console.error("[API Error]", err instanceof Error ? err.message : err);
  }
  return apiErrorResponse(userMessage, 500);
}
