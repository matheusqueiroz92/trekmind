/**
 * Logger estruturado com níveis (info, warn, error).
 * Em produção: saída JSON; em desenvolvimento: texto legível.
 * Evita logar dados sensíveis (tokens, senhas).
 */

type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

const isProd = process.env.NODE_ENV === "production";

function formatPayload(level: LogLevel, message: string, meta?: Record<string, unknown>): LogPayload {
  const payload: LogPayload = { level, message };
  if (meta && Object.keys(meta).length > 0) {
    for (const [k, v] of Object.entries(meta)) {
      if (v !== undefined && v !== null) payload[k] = v;
    }
  }
  return payload;
}

function write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "test") return;
  const payload = formatPayload(level, message, meta);
  const out = isProd ? JSON.stringify(payload) : `${level.toUpperCase()}: ${message}${meta ? " " + JSON.stringify(meta) : ""}`;
  if (level === "error") {
    console.error(out);
  } else if (level === "warn") {
    console.warn(out);
  } else {
    console.log(out);
  }
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    write("info", message, meta);
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    write("warn", message, meta);
  },
  error(message: string, meta?: Record<string, unknown>): void {
    write("error", message, meta);
  },
};
