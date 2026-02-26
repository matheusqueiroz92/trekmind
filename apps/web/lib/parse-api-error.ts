/**
 * Extrai uma mensagem de erro amigável a partir da resposta da API ou de falhas de rede.
 * Usado no frontend para exibir erros consistentes em português.
 */

const FALLBACK_MESSAGES: Record<number, string> = {
  400: "Requisição inválida. Verifique os dados.",
  401: "Sessão inválida ou expirada. Faça login novamente.",
  403: "Você não tem permissão para esta ação.",
  404: "Recurso não encontrado.",
  409: "Conflito com dados já existentes.",
  422: "Dados inválidos. Corrija e tente novamente.",
  500: "Ocorreu um erro. Tente novamente em alguns instantes.",
  502: "Serviço temporariamente indisponível. Tente mais tarde.",
  503: "Serviço temporariamente indisponível. Tente mais tarde.",
};

const DEFAULT_MESSAGE = "Ocorreu um erro. Tente novamente.";

export interface ParsedApiError {
  message: string;
  status: number | null;
  isNetworkError: boolean;
}

/**
 * Tenta extrair mensagem de erro do body JSON (formato { error: string } ou similar).
 */
function getMessageFromBody(body: unknown): string | null {
  if (body == null || typeof body !== "object") return null;
  const obj = body as Record<string, unknown>;
  if (typeof obj.error === "string" && obj.error.trim()) return obj.error.trim();
  if (typeof obj.message === "string" && obj.message.trim()) return obj.message.trim();
  return null;
}

/**
 * Dado um fetch Response e opcionalmente o body já parseado,
 * retorna uma mensagem amigável para exibir ao usuário.
 */
export function parseApiError(
  response: Response | null,
  body: unknown = null
): ParsedApiError {
  if (response == null) {
    return {
      message: "Verifique sua conexão e tente novamente.",
      status: null,
      isNetworkError: true,
    };
  }

  const status = response.status;
  const fromBody = body !== null ? getMessageFromBody(body) : null;
  const message =
    fromBody ?? FALLBACK_MESSAGES[status] ?? DEFAULT_MESSAGE;

  return {
    message,
    status,
    isNetworkError: false,
  };
}

/**
 * Helper para uso em try/catch: tenta ler res.text() e fazer parse do JSON
 * para obter o body, depois chama parseApiError.
 * Use quando você tem a Response mas ainda não leu o body.
 */
export async function parseApiErrorFromResponse(
  response: Response
): Promise<ParsedApiError> {
  let body: unknown = null;
  try {
    const text = await response.text();
    body = text ? JSON.parse(text) : null;
  } catch {
    // body não é JSON ou vazio
  }
  return parseApiError(response, body);
}

/**
 * Retorna a mensagem de erro como string (para setError(message)).
 */
export function getApiErrorMessage(
  response: Response | null,
  body: unknown = null
): string {
  return parseApiError(response, body).message;
}
