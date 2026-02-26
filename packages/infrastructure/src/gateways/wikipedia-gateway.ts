import type { IWikiProvider, WikiSearchResult } from "@trekmind/application";

const WIKI_API = "https://en.wikipedia.org/w/api.php";

export class WikipediaGateway implements IWikiProvider {
  async search(term: string): Promise<WikiSearchResult[]> {
    if (!term.trim()) return [];
    const params = new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: term,
      format: "json",
      origin: "*",
      srlimit: "10",
    });
    const res = await fetch(`${WIKI_API}?${params}`);
    const data = (await res.json()) as {
      query?: { search?: Array<{ title: string; snippet: string; pageid: number }> };
    };
    const list = data.query?.search ?? [];
    return list.map((item) => ({
      title: item.title,
      extract: stripHtml(item.snippet),
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`,
    }));
  }

  async searchNearby(
    latitude: number,
    longitude: number,
    radiusKm = 10
  ): Promise<WikiSearchResult[]> {
    const radiusM = Math.min(radiusKm * 1000, 10000);
    const params = new URLSearchParams({
      action: "query",
      list: "geosearch",
      gscoord: `${latitude}|${longitude}`,
      gsradius: String(radiusM),
      format: "json",
      origin: "*",
      gslimit: "15",
    });
    const res = await fetch(`${WIKI_API}?${params}`);
    const data = (await res.json()) as {
      query?: {
        geosearch?: Array<{
          title: string;
          lat: number;
          lon: number;
          dist: number;
          pageid: number;
        }>;
      };
    };
    const list = data.query?.geosearch ?? [];
    return list.slice(0, 10).map((item) => ({
      title: item.title,
      description: `${item.title} (${(item.dist / 1000).toFixed(1)} km away)`,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`,
      latitude: item.lat,
      longitude: item.lon,
    }));
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
