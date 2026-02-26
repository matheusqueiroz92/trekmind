import { describe, it, expect } from "vitest";
import { Address } from "./address";

describe("Address Value Object", () => {
  it("should create with country only", () => {
    const addr = Address.create({ country: "Brazil" });
    expect(addr.country).toBe("Brazil");
    expect(addr.getValue()).toBe("Brazil");
  });

  it("should create with full props", () => {
    const addr = Address.create({
      street: "Av. Paulista",
      city: "São Paulo",
      country: "Brazil",
    });
    expect(addr.street).toBe("Av. Paulista");
    expect(addr.city).toBe("São Paulo");
    expect(addr.country).toBe("Brazil");
  });

  it("should reject empty country", () => {
    expect(() => Address.create({ country: "" })).toThrow();
  });

  it("should create from string", () => {
    const addr = Address.fromString("Rua X, 123");
    expect(addr.country).toBe("Rua X, 123");
  });

  it("should reject empty string in fromString", () => {
    expect(() => Address.fromString("")).toThrow();
  });
});
