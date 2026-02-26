import { describe, it, expect } from "vitest";
import { LatLong } from "./lat-long";

describe("LatLong Value Object", () => {
  it("should create valid coordinates", () => {
    const coords = LatLong.create({ latitude: -23.55, longitude: -46.63 });
    expect(coords.latitude).toBe(-23.55);
    expect(coords.longitude).toBe(-46.63);
  });

  it("should reject latitude above 90", () => {
    expect(() => LatLong.create({ latitude: 91, longitude: 0 })).toThrow();
  });

  it("should reject latitude below -90", () => {
    expect(() => LatLong.create({ latitude: -91, longitude: 0 })).toThrow();
  });

  it("should reject longitude above 180", () => {
    expect(() => LatLong.create({ latitude: 0, longitude: 181 })).toThrow();
  });

  it("should reject longitude below -180", () => {
    expect(() => LatLong.create({ latitude: 0, longitude: -181 })).toThrow();
  });

  it("should accept boundary values", () => {
    const north = LatLong.create({ latitude: 90, longitude: 0 });
    const south = LatLong.create({ latitude: -90, longitude: 0 });
    expect(north.latitude).toBe(90);
    expect(south.latitude).toBe(-90);
  });
});
