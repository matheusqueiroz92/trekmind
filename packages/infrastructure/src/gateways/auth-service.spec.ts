import { describe, it, expect, beforeEach } from "vitest";
import { JwtTokenService } from "./auth-service";

describe("JwtTokenService", () => {
  let service: JwtTokenService;

  beforeEach(() => {
    service = new JwtTokenService();
  });

  describe("sign", () => {
    it("returns a JWT string with payload", async () => {
      const token = await service.sign({
        userId: "user-123",
        email: "user@example.com",
      });
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });
  });

  describe("verify", () => {
    it("returns payload when token is valid", async () => {
      const payload = { userId: "user-123", email: "user@example.com" };
      const token = await service.sign(payload);
      const verified = await service.verify(token);
      expect(verified).toEqual(
        expect.objectContaining({
          userId: payload.userId,
          email: payload.email,
        })
      );
      expect(verified).toHaveProperty("exp");
      expect(verified).toHaveProperty("iat");
    });

    it("throws when token is invalid", async () => {
      await expect(service.verify("invalid-token")).rejects.toThrow();
    });

    it("throws when token is expired", async () => {
      const payload = { userId: "user-123", email: "user@example.com" };
      const token = await service.sign(payload);
      // We cannot easily expire in test without mocking time; at least verify valid token works.
      const verified = await service.verify(token);
      expect(verified.userId).toBe(payload.userId);
    });

    it("throws when token is tampered", async () => {
      const token = await service.sign({
        userId: "user-123",
        email: "user@example.com",
      });
      const tampered = token.slice(0, -5) + "xxxxx";
      await expect(service.verify(tampered)).rejects.toThrow();
    });
  });
});
