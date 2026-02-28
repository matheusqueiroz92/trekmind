import { describe, it, expect, beforeEach, vi } from "vitest";
import { WikipediaGateway } from "./wikipedia-gateway";

describe("WikipediaGateway", () => {
  let gateway: WikipediaGateway;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    gateway = new WikipediaGateway();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  describe("search", () => {
    it("returns empty array when term is empty or whitespace", async () => {
      expect(await gateway.search("")).toEqual([]);
      expect(await gateway.search("   ")).toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("calls pt.wikipedia.org when no lang is passed (default)", async () => {
      fetchMock.mockResolvedValueOnce({
        json: async () => ({ query: { search: [] } }),
      });
      await gateway.search("Paris");
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("https://pt.wikipedia.org/w/api.php")
      );
    });

    it("calls language-specific wiki when lang is passed", async () => {
      fetchMock.mockResolvedValueOnce({
        json: async () => ({ query: { search: [] } }),
      });
      await gateway.search("Paris", "pt");
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("https://pt.wikipedia.org/w/api.php")
      );
    });

    it("maps search results to WikiSearchResult with title, extract and url", async () => {
      fetchMock.mockResolvedValueOnce({
        json: async () => ({
          query: {
            search: [
              { title: "Paris", snippet: "Paris is the <b>capital</b> of France.", pageid: 1 },
            ],
          },
        }),
      });
      const results = await gateway.search("Paris");
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        title: "Paris",
        extract: expect.stringContaining("Paris"),
        url: expect.stringContaining("wikipedia.org/wiki/Paris"),
      });
    });
  });

  describe("searchNearby", () => {
    it("calls geosearch with coordinates and uses pt when no lang (default)", async () => {
      fetchMock.mockResolvedValueOnce({
        json: async () => ({ query: { geosearch: [] } }),
      });
      await gateway.searchNearby(-22.9, -43.2, 5);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("https://pt.wikipedia.org/w/api.php")
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(/gscoord=-22\.9%7C-43\.2/)
      );
    });

    it("uses language-specific wiki when lang is passed", async () => {
      fetchMock.mockResolvedValueOnce({
        json: async () => ({ query: { geosearch: [] } }),
      });
      await gateway.searchNearby(0, 0, 10, "pt");
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("https://pt.wikipedia.org/w/api.php")
      );
    });

    it("maps geosearch results with title, url, lat, lng, description", async () => {
      fetchMock.mockResolvedValueOnce({
        json: async () => ({
          query: {
            geosearch: [
              { title: "Rio de Janeiro", lat: -22.9, lon: -43.2, dist: 500, pageid: 2 },
            ],
          },
        }),
      });
      const results = await gateway.searchNearby(-22.9, -43.2);
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        title: "Rio de Janeiro",
        latitude: -22.9,
        longitude: -43.2,
        url: expect.stringContaining("wikipedia.org/wiki/"),
      });
      expect(results[0].description).toMatch(/km away/);
    });
  });

  describe("getPageSummary", () => {
    it("returns null when response is not ok", async () => {
      fetchMock.mockResolvedValueOnce({ ok: false });
      const result = await gateway.getPageSummary("Paris");
      expect(result).toBeNull();
    });

    it("returns null when response has no title (missing page)", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });
      const result = await gateway.getPageSummary("NonExistentPage12345");
      expect(result).toBeNull();
    });

    it("calls REST API summary endpoint with encoded title (default pt)", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          title: "Paris",
          extract: "Paris is the capital of France.",
          content_urls: { desktop: { page: "https://pt.wikipedia.org/wiki/Paris" } },
        }),
      });
      await gateway.getPageSummary("Paris");
      expect(fetchMock).toHaveBeenCalledWith(
        "https://pt.wikipedia.org/api/rest_v1/page/summary/Paris"
      );
    });

    it("uses language-specific REST API when lang is passed", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          title: "Paris",
          extract: "Paris é a capital da França.",
          content_urls: { desktop: { page: "https://pt.wikipedia.org/wiki/Paris" } },
        }),
      });
      await gateway.getPageSummary("Paris", "pt");
      expect(fetchMock).toHaveBeenCalledWith(
        "https://pt.wikipedia.org/api/rest_v1/page/summary/Paris"
      );
    });

    it("returns WikiPageSummary with extract, url, thumbnail when present", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          title: "Paris",
          extract: "Paris is the capital of France.",
          description: "Capital of France",
          content_urls: { desktop: { page: "https://en.wikipedia.org/wiki/Paris" } },
          thumbnail: { source: "https://upload.wikimedia.org/paris.jpg" },
          coordinates: { lat: 48.8566, lon: 2.3522 },
          pageid: 1,
        }),
      });
      const result = await gateway.getPageSummary("Paris");
      expect(result).not.toBeNull();
      expect(result).toMatchObject({
        title: "Paris",
        extract: "Paris is the capital of France.",
        description: "Capital of France",
        url: "https://en.wikipedia.org/wiki/Paris",
        thumbnailUrl: "https://upload.wikimedia.org/paris.jpg",
        latitude: 48.8566,
        longitude: 2.3522,
        pageId: 1,
      });
    });

    it("returns summary without optional fields when absent", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          title: "Paris",
          extract: "Paris is the capital.",
          content_urls: { desktop: { page: "https://en.wikipedia.org/wiki/Paris" } },
        }),
      });
      const result = await gateway.getPageSummary("Paris");
      expect(result).toMatchObject({
        title: "Paris",
        extract: "Paris is the capital.",
        url: "https://en.wikipedia.org/wiki/Paris",
      });
      expect(result?.thumbnailUrl).toBeUndefined();
      expect(result?.latitude).toBeUndefined();
    });

    it("encodes title for URL (spaces and special chars)", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          title: "São Paulo",
          extract: "City in Brazil.",
          content_urls: { desktop: { page: "https://pt.wikipedia.org/wiki/S%C3%A3o_Paulo" } },
        }),
      });
      await gateway.getPageSummary("São Paulo", "pt");
      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl).toContain("pt.wikipedia.org");
      expect(calledUrl).toMatch(/summary\/.+/);
      expect(decodeURIComponent(calledUrl)).toContain("São");
    });
  });
});
