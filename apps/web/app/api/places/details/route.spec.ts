import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

const { executeMock } = vi.hoisted(() => ({ executeMock: vi.fn() }));

vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn().mockResolvedValue(null) }));

vi.mock("@trekmind/application", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@trekmind/application")>();
  return {
    ...actual,
    GetPlaceDetailsUseCase: class {
      execute = executeMock;
    },
  };
});

vi.mock("@trekmind/infrastructure", () => ({
  WikipediaGateway: class {},
}));

describe("GET /api/places/details", () => {
  beforeEach(() => {
    executeMock.mockReset();
  });

  it("returns 400 when title is missing", async () => {
    const res = await GET(
      new Request("http://localhost:3000/api/places/details")
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("returns 400 when title is empty", async () => {
    const res = await GET(
      new Request("http://localhost:3000/api/places/details?title=%20")
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when place details not found", async () => {
    executeMock.mockResolvedValue(null);
    const res = await GET(
      new Request("http://localhost:3000/api/places/details?title=NonExistent123")
    );
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("returns 200 with details when found", async () => {
    const details = {
      title: "Paris",
      extract: "Paris is the capital of France.",
      url: "https://en.wikipedia.org/wiki/Paris",
      thumbnailUrl: "https://upload.wikimedia.org/paris.jpg",
      latitude: 48.8566,
      longitude: 2.3522,
    };
    executeMock.mockResolvedValue(details);
    const res = await GET(
      new Request("http://localhost:3000/api/places/details?title=Paris")
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.title).toBe("Paris");
    expect(json.extract).toBe(details.extract);
    expect(json.url).toBe(details.url);
    expect(json.thumbnailUrl).toBe(details.thumbnailUrl);
  });

  it("passes lang when provided", async () => {
    const details = {
      title: "Paris",
      extract: "Paris é a capital da França.",
      url: "https://pt.wikipedia.org/wiki/Paris",
    };
    executeMock.mockResolvedValue(details);
    await GET(
      new Request("http://localhost:3000/api/places/details?title=Paris&lang=pt")
    );
    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Paris", lang: "pt" })
    );
  });
});
