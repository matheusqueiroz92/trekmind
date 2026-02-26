import { describe, it, expect } from "vitest";
import { Place } from "@trekmind/domain";
import { GetNearbyPlacesUseCase } from "./get-nearby-places.use-case";
import { InMemoryPlaceRepository } from "./repositories/in-memory/in-memory-place-repository";

describe("GetNearbyPlacesUseCase", () => {
  it("should return places within radius", async () => {
    const repo = new InMemoryPlaceRepository();
    const place = Place.create({
      id: "1",
      name: "MASP",
      category: "museum",
      latitude: -23.5614,
      longitude: -46.6562,
    });
    repo.add(place);

    const sut = new GetNearbyPlacesUseCase(repo);
    const result = await sut.execute({
      latitude: -23.56,
      longitude: -46.66,
      radiusKm: 5,
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("MASP");
    expect(result[0].latitude).toBe(-23.5614);
  });

  it("should filter by category when provided", async () => {
    const repo = new InMemoryPlaceRepository();
    repo.add(
      Place.create({
        id: "1",
        name: "MASP",
        category: "museum",
        latitude: -23.5614,
        longitude: -46.6562,
      })
    );
    repo.add(
      Place.create({
        id: "2",
        name: "Restaurante X",
        category: "restaurant",
        latitude: -23.562,
        longitude: -46.657,
      })
    );

    const sut = new GetNearbyPlacesUseCase(repo);
    const result = await sut.execute({
      latitude: -23.56,
      longitude: -46.66,
      radiusKm: 5,
      category: "museum",
    });

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("museum");
  });

  it("should return empty array when no places in radius", async () => {
    const repo = new InMemoryPlaceRepository();
    repo.add(
      Place.create({
        id: "1",
        name: "Far Away",
        category: "museum",
        latitude: 10,
        longitude: 10,
      })
    );

    const sut = new GetNearbyPlacesUseCase(repo);
    const result = await sut.execute({
      latitude: -23.56,
      longitude: -46.66,
      radiusKm: 5,
    });

    expect(result).toHaveLength(0);
  });
});
