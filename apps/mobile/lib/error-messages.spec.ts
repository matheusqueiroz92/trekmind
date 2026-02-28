import { describe, it, expect } from "vitest";
import { ERROR_MESSAGES, apiErrorMessage } from "./error-messages";

describe("ERROR_MESSAGES", () => {
  it("exposes expected keys", () => {
    expect(ERROR_MESSAGES.LOGIN_FAILED).toBeDefined();
    expect(ERROR_MESSAGES.REGISTER_FAILED).toBeDefined();
    expect(ERROR_MESSAGES.NETWORK).toBeDefined();
    expect(ERROR_MESSAGES.CHAT_FAILED).toBeDefined();
    expect(ERROR_MESSAGES.UNAUTHORIZED).toBeDefined();
  });
});

describe("apiErrorMessage", () => {
  it("returns data.error when present and non-empty", () => {
    expect(apiErrorMessage({ error: "E-mail e senha são obrigatórios." }, "Fallback")).toBe(
      "E-mail e senha são obrigatórios."
    );
  });

  it("returns fallback when data is null", () => {
    expect(apiErrorMessage(null, ERROR_MESSAGES.LOGIN_FAILED)).toBe(ERROR_MESSAGES.LOGIN_FAILED);
  });

  it("returns fallback when data.error is empty string", () => {
    expect(apiErrorMessage({ error: "" }, "Fallback")).toBe("Fallback");
  });

  it("returns fallback when data.error is only whitespace", () => {
    expect(apiErrorMessage({ error: "   " }, "Fallback")).toBe("Fallback");
  });
});
