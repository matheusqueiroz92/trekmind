import { describe, it, expect, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn().mockResolvedValue(null) }));

vi.mock("@trekmind/infrastructure", () => ({
  ExternalPlaceRepository: class {},
  WikipediaGateway: class {},
  GeocodingServiceImpl: class {},
  TravelRetrievalService: class {
    getContext = vi.fn().mockResolvedValue("context");
  },
  OpenAILLMClient: class {
    generate = vi.fn().mockResolvedValue("Resposta mockada.");
  },
}));

describe("POST /api/chat", () => {
  it("returns 400 when message is missing", async () => {
    const res = await POST(
      new Request("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Envie uma mensagem.");
  });

  it("returns 400 when message is empty", async () => {
    const res = await POST(
      new Request("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: "   " }),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Envie uma mensagem.");
  });

  it("returns 200 with answer when message is valid", async () => {
    const res = await POST(
      new Request("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: "O que fazer em Paris?" }),
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.answer).toBe("Resposta mockada.");
  });
});
