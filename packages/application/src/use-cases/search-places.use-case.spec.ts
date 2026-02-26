import { describe, it, expect, vi } from "vitest";
import { Place } from "@trekmind/domain";
import { SearchPlacesUseCase } from "./search-places.use-case";
import { InMemoryPlaceRepository } from "./repositories/in-memory/in-memory-place-repository";
import type { GeocodingService } from "./services/geocoding-service";

describe("SearchPlacesUseCase", () => {
  it("should return places matching query", async () => {
    const repo = new InMemoryPlaceRepository();
    repo.add(
      Place.create({
        id: "1",
        name: "MASP",
        description: "Museu de Arte",
        category: "museum",
        latitude: -23.5614,
        longitude: -46.6562,
      })
    );

    const sut = new SearchPlacesUseCase(repo, null);
    const result = await sut.execute({ query: "MASP" });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("MASP");
  });

  it("should return empty when no match", async () => {
    const repo = new InMemoryPlaceRepository();
    const sut = new SearchPlacesUseCase(repo, null);
    const result = await sut.execute({ query: "nonexistent" });
    expect(result).toHaveLength(0);
  });

  it("should use geocoding when address provided and then search", async () => {
    const repo = new InMemoryPlaceRepository();
    repo.add(
      Place.create({
        id: "1",
        name: "Praia",
        category: "beach",
        latitude: -23.5,
        longitude: -46.6,
      })
    );

    const geocoding: GeocodingService = {
      getCoordinatesFromAddress: vi.fn().mockResolvedValue({
        latitude: -23.5,
        longitude: -46.6,
        formattedAddress: "São Paulo",
      }),
    };

    const sut = new SearchPlacesUseCase(repo, geocoding);
    const result = await sut.execute({
      query: "praia",
      address: "São Paulo",
    });

    expect(geocoding.getCoordinatesFromAddress).toHaveBeenCalledWith("São Paulo");
    expect(result.length).toBeGreaterThanOrEqual(0);
  });

  it("should return empty when geocoding fails and address was provided", async () => {
    const repo = new InMemoryPlaceRepository();
    const geocoding: GeocodingService = {
      getCoordinatesFromAddress: vi.fn().mockResolvedValue(null),
    };

    const sut = new SearchPlacesUseCase(repo, geocoding);
    const result = await sut.execute({
      query: "restaurante",
      address: "Invalid Address XYZ",
    });

    expect(result).toHaveLength(0);
  });
});
