import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

const { executeMock } = vi.hoisted(() => ({ executeMock: vi.fn() }));

vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn().mockResolvedValue(null) }));

vi.mock("@trekmind/application", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@trekmind/application")>();
  return {
    ...actual,
    ResolvePlaceUseCase: class {
      execute = executeMock;
    },
  };
});

vi.mock("@trekmind/infrastructure", () => ({
  GeocodingServiceImpl: class {
    constructor() {}
  },
}));

describe("GET /api/places/resolve", () => {
  beforeEach(() => {
    executeMock.mockReset();
  });

  it("returns 400 when q is missing", async () => {
    const res = await GET(
      new Request("http://localhost:3000/api/places/resolve")
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("returns 400 when q is empty", async () => {
    const res = await GET(
      new Request("http://localhost:3000/api/places/resolve?q=%20")
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when place cannot be resolved", async () => {
    executeMock.mockResolvedValue(null);
    const res = await GET(
      new Request("http://localhost:3000/api/places/resolve?q=NonExistent123")
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("returns 200 with resolved place when found", async () => {
    const resolved = {
      name: "Itapetinga, Bahia, Brasil",
      latitude: -12.25,
      longitude: -38.95,
    };
    executeMock.mockResolvedValue(resolved);
    const res = await GET(
      new Request("http://localhost:3000/api/places/resolve?q=Itapetinga")
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.name).toBe(resolved.name);
    expect(json.latitude).toBe(resolved.latitude);
    expect(json.longitude).toBe(resolved.longitude);
  });

  it("passes query to use case", async () => {
    executeMock.mockResolvedValue({
      name: "Praia do Forte",
      latitude: -12.57,
      longitude: -38.0,
    });
    await GET(
      new Request("http://localhost:3000/api/places/resolve?q=Praia%20do%20Forte")
    );
    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({ query: "Praia do Forte" })
    );
  });
});
