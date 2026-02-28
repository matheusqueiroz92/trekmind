import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn().mockResolvedValue(null) }));

vi.mock("@trekmind/infrastructure", () => ({
  ExternalPlaceRepository: class {
    findNearby = vi.fn().mockResolvedValue([]);
    searchByQuery = vi.fn().mockResolvedValue([]);
  },
}));

describe("GET /api/places/nearby", () => {
  it("returns 400 when lat is missing", async () => {
    const res = await GET(
      new Request("http://localhost:3000/api/places/nearby?lng=10")
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("É necessário informar latitude e longitude.");
  });

  it("returns 400 when lng is missing", async () => {
    const res = await GET(
      new Request("http://localhost:3000/api/places/nearby?lat=10")
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("É necessário informar latitude e longitude.");
  });

  it("returns 200 with array when lat and lng are valid", async () => {
    const res = await GET(
      new Request("http://localhost:3000/api/places/nearby?lat=-23.5&lng=-46.6")
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
  });
});
