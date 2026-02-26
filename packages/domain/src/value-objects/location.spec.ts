import { describe, it, expect } from "vitest";
import { Location } from "./location";

describe("Location Value Object", () => {
  it("should create location from coordinates and radius", () => {
    const loc = Location.fromCoordinates({
      latitude: -23.55,
      longitude: -46.63,
      radiusKm: 5,
    });
    expect(loc.latitude).toBe(-23.55);
    expect(loc.longitude).toBe(-46.63);
    expect(loc.radiusKm).toBe(5);
    expect(loc.isCoordinateBased()).toBe(true);
  });

  it("should create location from address/city", () => {
    const loc = Location.fromAddress({ city: "São Paulo", country: "Brazil" });
    expect(loc.city).toBe("São Paulo");
    expect(loc.country).toBe("Brazil");
    expect(loc.isCoordinateBased()).toBe(false);
  });

  it("should use default radius when not provided", () => {
    const loc = Location.fromCoordinates({
      latitude: 0,
      longitude: 0,
    });
    expect(loc.radiusKm).toBeGreaterThan(0);
  });

  it("should reject radius above 100", () => {
    expect(() =>
      Location.fromCoordinates({
        latitude: 0,
        longitude: 0,
        radiusKm: 101,
      })
    ).toThrow();
  });
});
