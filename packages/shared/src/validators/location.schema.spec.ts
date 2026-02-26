import { describe, it, expect } from "vitest";
import { locationSchema, latLongSchema } from "./location.schema";

describe("locationSchema", () => {
  it("accepts valid coordinates with optional radius", () => {
    const result = locationSchema.safeParse({
      latitude: -23.55,
      longitude: -46.63,
      radiusKm: 10,
    });
    expect(result.success).toBe(true);
  });

  it("accepts address/city/country without coordinates", () => {
    const result = locationSchema.safeParse({ city: "São Paulo", country: "Brazil" });
    expect(result.success).toBe(true);
  });

  it("rejects when neither coordinates nor address provided", () => {
    const result = locationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects invalid latitude", () => {
    const result = locationSchema.safeParse({ latitude: 100, longitude: 0 });
    expect(result.success).toBe(false);
  });
});

describe("latLongSchema", () => {
  it("accepts valid lat/long", () => {
    const result = latLongSchema.safeParse({ latitude: 0, longitude: 0 });
    expect(result.success).toBe(true);
  });

  it("rejects longitude out of range", () => {
    const result = latLongSchema.safeParse({ latitude: 0, longitude: 200 });
    expect(result.success).toBe(false);
  });
});
