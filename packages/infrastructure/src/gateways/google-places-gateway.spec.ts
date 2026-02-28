import { describe, it, expect, beforeEach, vi } from "vitest";
import { GooglePlacesGateway } from "./google-places-gateway";

describe("GooglePlacesGateway", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("returns empty array when apiKey is empty", async () => {
    const gateway = new GooglePlacesGateway("");
    const result = await gateway.searchByCategory({
      query: "Paris",
      category: "restaurant",
    });
    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns empty array when apiKey is undefined", async () => {
    const gateway = new GooglePlacesGateway(undefined);
    const result = await gateway.searchByCategory({
      query: "Paris",
      category: "lodging",
    });
    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("calls Places API searchText with query and includedType", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ places: [] }),
    });
    const gateway = new GooglePlacesGateway("test-key");
    await gateway.searchByCategory({
      query: "Rio de Janeiro",
      category: "tourist_attraction",
      lang: "pt",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://places.googleapis.com/v1/places:searchText",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Goog-Api-Key": "test-key",
        }),
      })
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.textQuery).toBe("Rio de Janeiro");
    expect(body.includedType).toBe("tourist_attraction");
    expect(body.languageCode).toBe("pt");
  });

  it("maps API response to PlaceDTO with name, address, coordinates, rating", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        places: [
          {
            id: "places/ChIJ123",
            displayName: { text: "Restaurante XYZ" },
            formattedAddress: "Rua das Flores, 1",
            location: { latitude: 48.8566, longitude: 2.3522 },
            rating: 4.5,
          },
        ],
      }),
    });
    const gateway = new GooglePlacesGateway("test-key");
    const result = await gateway.searchByCategory({
      query: "Paris",
      category: "restaurant",
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: "Restaurante XYZ",
      address: "Rua das Flores, 1",
      latitude: 48.8566,
      longitude: 2.3522,
      category: "restaurant",
      source: "google",
    });
    expect(result[0].id).toBeDefined();
    expect(result[0].createdAt).toBeInstanceOf(Date);
  });

  it("returns empty array when response is not ok", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });
    const gateway = new GooglePlacesGateway("test-key");
    const result = await gateway.searchByCategory({
      query: "Paris",
      category: "restaurant",
    });
    expect(result).toEqual([]);
  });

  it("returns empty array when fetch throws", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network error"));
    const gateway = new GooglePlacesGateway("test-key");
    const result = await gateway.searchByCategory({
      query: "Paris",
      category: "restaurant",
    });
    expect(result).toEqual([]);
  });
});
