import { describe, it, expect, vi } from "vitest";
import { ResolvePlaceUseCase } from "./resolve-place.use-case";
import type { GeocodingService } from "./services/geocoding-service";

describe("ResolvePlaceUseCase", () => {
  it("returns null when geocoding returns null", async () => {
    const geocoding: GeocodingService = {
      getCoordinatesFromAddress: vi.fn().mockResolvedValue(null),
    };
    const sut = new ResolvePlaceUseCase(geocoding);
    const result = await sut.execute({ query: "NonExistentPlace" });
    expect(result).toBeNull();
    expect(geocoding.getCoordinatesFromAddress).toHaveBeenCalledWith("NonExistentPlace");
  });

  it("returns resolved place with name and coordinates", async () => {
    const geocodingResult = {
      latitude: -12.25,
      longitude: -38.95,
      formattedAddress: "Itapetinga, Bahia, Brasil",
    };
    const geocoding: GeocodingService = {
      getCoordinatesFromAddress: vi.fn().mockResolvedValue(geocodingResult),
    };
    const sut = new ResolvePlaceUseCase(geocoding);
    const result = await sut.execute({ query: "Itapetinga" });
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Itapetinga, Bahia, Brasil");
    expect(result?.latitude).toBe(-12.25);
    expect(result?.longitude).toBe(-38.95);
  });

  it("uses query as name when formattedAddress is missing", async () => {
    const geocodingResult = {
      latitude: -12.25,
      longitude: -38.95,
    };
    const geocoding: GeocodingService = {
      getCoordinatesFromAddress: vi.fn().mockResolvedValue(geocodingResult),
    };
    const sut = new ResolvePlaceUseCase(geocoding);
    const result = await sut.execute({ query: "Praia do Forte" });
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Praia do Forte");
    expect(result?.latitude).toBe(-12.25);
    expect(result?.longitude).toBe(-38.95);
  });

  it("returns null when query is empty", async () => {
    const geocoding: GeocodingService = {
      getCoordinatesFromAddress: vi.fn(),
    };
    const sut = new ResolvePlaceUseCase(geocoding);
    const result = await sut.execute({ query: "" });
    expect(result).toBeNull();
    expect(geocoding.getCoordinatesFromAddress).not.toHaveBeenCalled();
  });

  it("trims query before resolving", async () => {
    const geocoding: GeocodingService = {
      getCoordinatesFromAddress: vi.fn().mockResolvedValue({
        latitude: -23.55,
        longitude: -46.63,
        formattedAddress: "São Paulo, SP",
      }),
    };
    const sut = new ResolvePlaceUseCase(geocoding);
    await sut.execute({ query: "  São Paulo  " });
    expect(geocoding.getCoordinatesFromAddress).toHaveBeenCalledWith("São Paulo");
  });
});
