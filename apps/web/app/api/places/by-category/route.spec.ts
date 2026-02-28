import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

const mockExecute = vi.fn();

vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn().mockResolvedValue(null) }));

vi.mock("@trekmind/application", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@trekmind/application")>();
  return {
    ...actual,
    SearchPlacesByCategoryUseCase: class {
      execute = mockExecute;
    },
  };
});

vi.mock("@trekmind/infrastructure", () => ({
  GooglePlacesGateway: class {
    constructor(_apiKey: string | undefined) {}
  },
}));

describe("GET /api/places/by-category", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("returns 400 when q is missing", async () => {
    const res = await GET(
      new Request("http://localhost:3000/api/places/by-category")
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("returns 400 when q is empty", async () => {
    const res = await GET(
      new Request("http://localhost:3000/api/places/by-category?q=%20")
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 with grouped categories when q is valid", async () => {
    mockExecute.mockResolvedValue({
      restaurant: [{ id: "1", name: "R1", category: "restaurant", latitude: 0, longitude: 0, createdAt: new Date() }],
      lodging: [],
      tourist_attraction: [],
      bar: [],
    });
    const res = await GET(
      new Request("http://localhost:3000/api/places/by-category?q=Paris")
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("restaurant");
    expect(json).toHaveProperty("lodging");
    expect(json).toHaveProperty("tourist_attraction");
    expect(Array.isArray(json.restaurant)).toBe(true);
  });

  it("passes lang and categories to use case", async () => {
    mockExecute.mockResolvedValue({
      restaurant: [],
      lodging: [],
      tourist_attraction: [],
      bar: [],
    });
    await GET(
      new Request("http://localhost:3000/api/places/by-category?q=Rio&lang=pt&categories=restaurant,lodging")
    );
    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "Rio",
        lang: "pt",
        categories: ["restaurant", "lodging"],
      })
    );
  });
});
