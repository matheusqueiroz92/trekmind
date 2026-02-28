import type {
  IWikiProvider,
  WikiSearchResult,
  WikiPageSummary,
} from "@trekmind/application";

const DEFAULT_LANG = "pt";

function wikiBaseUrl(lang: string): string {
  const safe = lang?.trim() || DEFAULT_LANG;
  return `https://${safe}.wikipedia.org`;
}

export class WikipediaGateway implements IWikiProvider {
  async search(term: string, lang?: string): Promise<WikiSearchResult[]> {
    if (!term.trim()) return [];
    const base = wikiBaseUrl(lang ?? DEFAULT_LANG);
    const params = new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: term,
      format: "json",
      origin: "*",
      srlimit: "10",
    });
    const res = await fetch(`${base}/w/api.php?${params}`);
    const data = (await res.json()) as {
      query?: { search?: Array<{ title: string; snippet: string; pageid: number }> };
    };
    const list = data.query?.search ?? [];
    return list.map((item) => ({
      title: item.title,
      extract: stripHtml(item.snippet),
      url: `${base}/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`,
      pageId: item.pageid,
    }));
  }

  async searchNearby(
    latitude: number,
    longitude: number,
    radiusKm = 10,
    lang?: string
  ): Promise<WikiSearchResult[]> {
    const base = wikiBaseUrl(lang ?? DEFAULT_LANG);
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
    const res = await fetch(`${base}/w/api.php?${params}`);
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
      url: `${base}/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`,
      latitude: item.lat,
      longitude: item.lon,
      pageId: item.pageid,
    }));
  }

  async getPageSummary(title: string, lang?: string): Promise<WikiPageSummary | null> {
    if (!title?.trim()) return null;
    const base = wikiBaseUrl(lang ?? DEFAULT_LANG);
    const encodedTitle = encodeURIComponent(title.trim().replace(/ /g, "_"));
    const url = `${base}/api/rest_v1/page/summary/${encodedTitle}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      title?: string;
      extract?: string;
      description?: string;
      content_urls?: { desktop?: { page?: string } };
      thumbnail?: { source?: string };
      coordinates?: { lat?: number; lon?: number };
      pageid?: number;
    };
    if (!data.title) return null;
    return {
      title: data.title,
      extract: data.extract ?? "",
      description: data.description,
      url: data.content_urls?.desktop?.page ?? `${base}/wiki/${encodeURIComponent(data.title.replace(/ /g, "_"))}`,
      thumbnailUrl: data.thumbnail?.source,
      latitude: data.coordinates?.lat,
      longitude: data.coordinates?.lon,
      pageId: data.pageid,
    };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
