import { describe, it, expect, vi } from "vitest";
import { GetPlaceDetailsUseCase } from "./get-place-details.use-case";
import type { IWikiProvider } from "./services/wiki-provider";

describe("GetPlaceDetailsUseCase", () => {
  it("returns null when wiki provider returns null", async () => {
    const wiki: IWikiProvider = {
      search: vi.fn(),
      searchNearby: vi.fn(),
      getPageSummary: vi.fn().mockResolvedValue(null),
    };
    const sut = new GetPlaceDetailsUseCase(wiki);
    const result = await sut.execute({ title: "NonExistent" });
    expect(result).toBeNull();
    expect(wiki.getPageSummary).toHaveBeenCalledWith("NonExistent", "pt");
    expect(wiki.getPageSummary).toHaveBeenCalledWith("NonExistent", "en");
  });

  it("returns place details when wiki provider returns summary", async () => {
    const summary = {
      title: "Paris",
      extract: "Paris is the capital of France.",
      description: "Capital of France",
      url: "https://en.wikipedia.org/wiki/Paris",
      thumbnailUrl: "https://upload.wikimedia.org/paris.jpg",
      latitude: 48.8566,
      longitude: 2.3522,
      pageId: 1,
    };
    const wiki: IWikiProvider = {
      search: vi.fn(),
      searchNearby: vi.fn(),
      getPageSummary: vi.fn().mockResolvedValue(summary),
    };
    const sut = new GetPlaceDetailsUseCase(wiki);
    const result = await sut.execute({ title: "Paris" });
    expect(result).not.toBeNull();
    expect(result).toEqual(summary);
    expect(wiki.getPageSummary).toHaveBeenCalledWith("Paris", "pt");
  });

  it("passes lang to wiki provider when provided", async () => {
    const wiki: IWikiProvider = {
      search: vi.fn(),
      searchNearby: vi.fn(),
      getPageSummary: vi.fn().mockResolvedValue({
        title: "Paris",
        extract: "Paris é a capital da França.",
        url: "https://pt.wikipedia.org/wiki/Paris",
      }),
    };
    const sut = new GetPlaceDetailsUseCase(wiki);
    await sut.execute({ title: "Paris", lang: "pt" });
    expect(wiki.getPageSummary).toHaveBeenCalledWith("Paris", "pt");
  });

  it("returns null when title is empty string", async () => {
    const wiki: IWikiProvider = {
      search: vi.fn(),
      searchNearby: vi.fn(),
      getPageSummary: vi.fn(),
    };
    const sut = new GetPlaceDetailsUseCase(wiki);
    const result = await sut.execute({ title: "" });
    expect(result).toBeNull();
    expect(wiki.getPageSummary).not.toHaveBeenCalled();
  });

  it("falls back to en when pt returns null (lang: pt requested)", async () => {
    const enSummary = {
      title: "Itapetinga",
      extract: "Itapetinga is a municipality in Bahia, Brazil.",
      url: "https://en.wikipedia.org/wiki/Itapetinga",
      lang: "en",
    };
    const wiki: IWikiProvider = {
      search: vi.fn(),
      searchNearby: vi.fn(),
      getPageSummary: vi.fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(enSummary),
    };
    const sut = new GetPlaceDetailsUseCase(wiki);
    const result = await sut.execute({ title: "Itapetinga", lang: "pt" });
    expect(result).not.toBeNull();
    expect(result?.title).toBe("Itapetinga");
    expect(result?.extract).toBe(enSummary.extract);
    expect(result?.lang).toBe("en");
    expect(wiki.getPageSummary).toHaveBeenNthCalledWith(1, "Itapetinga", "pt");
    expect(wiki.getPageSummary).toHaveBeenNthCalledWith(2, "Itapetinga", "en");
  });
});
