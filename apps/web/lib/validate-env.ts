/**
 * Valida variáveis de ambiente obrigatórias no startup.
 * Deve ser chamado cedo (ex.: ao tratar a primeira requisição de API).
 */

const required = [
  "BETTER_AUTH_SECRET",
] as const;

const optionalButRecommended = [
  "DATABASE_URL",
  "NEXT_PUBLIC_SITE_URL",
  "OPENAI_API_KEY",
] as const;

let validated = false;

export function validateEnv(): void {
  if (validated) return;
  if (process.env.NODE_ENV === "test") {
    validated = true;
    return;
  }
  const missing: string[] = [];
  for (const key of required) {
    const value = process.env[key];
    if (value == null || String(value).trim() === "") {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias não definidas: ${missing.join(", ")}. Verifique .env ou .env.local.`
    );
  }
  validated = true;
}

export function getEnvWarnings(): string[] {
  const warnings: string[] = [];
  for (const key of optionalButRecommended) {
    const value = process.env[key];
    if (value == null || String(value).trim() === "") {
      warnings.push(`Variável opcional não definida: ${key}`);
    }
  }
  return warnings;
}
