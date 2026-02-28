import { describe, it, expect } from "vitest";
import { Place } from "./place";

describe("Place Entity", () => {
  it("should create a valid place", () => {
    const place = Place.create({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "MASP",
      description: "Museu de Arte",
      category: "museum",
      latitude: -23.5614,
      longitude: -46.6562,
      source: "wikipedia",
    });

    expect(place.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(place.name).toBe("MASP");
    expect(place.description).toBe("Museu de Arte");
    expect(place.category.getValue()).toBe("museum");
    expect(place.coordinates.latitude).toBe(-23.5614);
    expect(place.coordinates.longitude).toBe(-46.6562);
    expect(place.source).toBe("wikipedia");
  });

  it("should not allow empty name", () => {
    expect(() =>
      Place.create({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "",
        category: "museum",
        latitude: 0,
        longitude: 0,
      })
    ).toThrow();
  });

  it("should not allow invalid coordinates", () => {
    expect(() =>
      Place.create({
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Test",
        category: "museum",
        latitude: 100,
        longitude: 0,
      })
    ).toThrow();
  });

  it("should reconstitute from persisted data", () => {
    const place = Place.reconstitute({
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Ibirapuera",
      description: "Parque",
      category: "park",
      latitude: -23.5872,
      longitude: -46.6576,
      address: "Av. Pedro Álvares Cabral",
      source: "google",
      createdAt: new Date("2024-01-01"),
    });

    expect(place.id).toBe("550e8400-e29b-41d4-a716-446655440001");
    expect(place.name).toBe("Ibirapuera");
    expect(place.createdAt).toEqual(new Date("2024-01-01"));
  });

  it("should accept optional url and imageUrl on create", () => {
    const place = Place.create({
      id: "wiki-Paris-0",
      name: "Paris",
      description: "Capital of France",
      category: "other",
      latitude: 48.8566,
      longitude: 2.3522,
      url: "https://en.wikipedia.org/wiki/Paris",
      imageUrl: "https://upload.wikimedia.org/paris.jpg",
      source: "wikipedia",
    });
    expect(place.url).toBe("https://en.wikipedia.org/wiki/Paris");
    expect(place.imageUrl).toBe("https://upload.wikimedia.org/paris.jpg");
  });

  it("should reconstitute with url, imageUrl and wikipediaTitle", () => {
    const place = Place.reconstitute({
      id: "wiki-Paris-0",
      name: "Paris",
      description: "Capital of France",
      category: "other",
      latitude: 48.8566,
      longitude: 2.3522,
      url: "https://pt.wikipedia.org/wiki/Paris",
      imageUrl: "https://upload.wikimedia.org/paris.jpg",
      wikipediaTitle: "Paris",
      source: "wikipedia",
      createdAt: new Date(),
    });
    expect(place.url).toBe("https://pt.wikipedia.org/wiki/Paris");
    expect(place.imageUrl).toBe("https://upload.wikimedia.org/paris.jpg");
    expect(place.wikipediaTitle).toBe("Paris");
  });
});
