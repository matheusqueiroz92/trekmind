import { describe, it, expect, vi } from "vitest";
import { SearchPlacesByCategoryUseCase } from "./search-places-by-category.use-case";
import type { IPlacesByCategoryProvider } from "./services/places-by-category-provider";

describe("SearchPlacesByCategoryUseCase", () => {
  it("returns empty categories when provider returns empty for all", async () => {
    const provider: IPlacesByCategoryProvider = {
      searchByCategory: vi.fn().mockResolvedValue([]),
    };
    const sut = new SearchPlacesByCategoryUseCase(provider);
    const result = await sut.execute({
      query: "Paris",
      categories: ["restaurant", "lodging", "tourist_attraction"],
    });
    expect(result.restaurant).toEqual([]);
    expect(result.lodging).toEqual([]);
    expect(result.tourist_attraction).toEqual([]);
    expect(provider.searchByCategory).toHaveBeenCalledTimes(3);
  });

  it("aggregates results by category from provider", async () => {
    const provider: IPlacesByCategoryProvider = {
      searchByCategory: vi.fn((req) => {
        if (req.category === "restaurant") {
          return Promise.resolve([
            {
              id: "r1",
              name: "Restaurante X",
              category: "restaurant",
              latitude: 48.8,
              longitude: 2.3,
              address: "Rua 1",
              source: "google",
              createdAt: new Date(),
            },
          ]);
        }
        if (req.category === "lodging") {
          return Promise.resolve([
            {
              id: "h1",
              name: "Hotel Y",
              category: "lodging",
              latitude: 48.81,
              longitude: 2.31,
              source: "google",
              createdAt: new Date(),
            },
          ]);
        }
        return Promise.resolve([]);
      }),
    };
    const sut = new SearchPlacesByCategoryUseCase(provider);
    const result = await sut.execute({
      query: "Paris",
      categories: ["restaurant", "lodging", "tourist_attraction"],
    });
    expect(result.restaurant).toHaveLength(1);
    expect(result.restaurant[0].name).toBe("Restaurante X");
    expect(result.lodging).toHaveLength(1);
    expect(result.lodging[0].name).toBe("Hotel Y");
    expect(result.tourist_attraction).toHaveLength(0);
  });

  it("passes query and lang to provider for each category", async () => {
    const provider: IPlacesByCategoryProvider = {
      searchByCategory: vi.fn().mockResolvedValue([]),
    };
    const sut = new SearchPlacesByCategoryUseCase(provider);
    await sut.execute({
      query: "Rio de Janeiro",
      categories: ["restaurant"],
      lang: "pt",
    });
    expect(provider.searchByCategory).toHaveBeenCalledWith({
      query: "Rio de Janeiro",
      category: "restaurant",
      lang: "pt",
    });
  });

  it("passes latitude and longitude when provided", async () => {
    const provider: IPlacesByCategoryProvider = {
      searchByCategory: vi.fn().mockResolvedValue([]),
    };
    const sut = new SearchPlacesByCategoryUseCase(provider);
    await sut.execute({
      latitude: -22.9,
      longitude: -43.2,
      categories: ["tourist_attraction"],
    });
    expect(provider.searchByCategory).toHaveBeenCalledWith({
      latitude: -22.9,
      longitude: -43.2,
      category: "tourist_attraction",
    });
  });
});
