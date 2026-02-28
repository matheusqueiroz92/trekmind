import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn().mockResolvedValue(null) }));

vi.mock("@trekmind/infrastructure", () => ({
  ExternalPlaceRepository: class {
    searchByQuery = vi.fn().mockResolvedValue([]);
    findNearby = vi.fn().mockResolvedValue([]);
  },
  GeocodingServiceImpl: class {},
}));

describe("GET /api/places/search", () => {
  it("returns 400 when q is missing", async () => {
    const res = await GET(
      new Request("http://localhost:3000/api/places/search")
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Digite o que deseja buscar");
  });

  it("returns 400 when q is empty", async () => {
    const res = await GET(
      new Request("http://localhost:3000/api/places/search?q=%20")
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Digite o que deseja buscar");
  });

  it("returns 200 with array when q is valid", async () => {
    const res = await GET(
      new Request("http://localhost:3000/api/places/search?q=Paris")
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
  });
});
