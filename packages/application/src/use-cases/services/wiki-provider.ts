export interface WikiSearchResult {
  title: string;
  description?: string;
  extract?: string;
  url?: string;
  thumbnailUrl?: string;
  latitude?: number;
  longitude?: number;
  pageId?: number;
}

/** Summary of a single Wikipedia page (REST API). */
export interface WikiPageSummary {
  title: string;
  extract: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  latitude?: number;
  longitude?: number;
  pageId?: number;
  /** When present, indicates content language (e.g. "en" for fallback from pt). */
  lang?: string;
}

export interface IWikiProvider {
  search(term: string, lang?: string): Promise<WikiSearchResult[]>;
  searchNearby(
    latitude: number,
    longitude: number,
    radiusKm?: number,
    lang?: string
  ): Promise<WikiSearchResult[]>;
  getPageSummary(title: string, lang?: string): Promise<WikiPageSummary | null>;
}
