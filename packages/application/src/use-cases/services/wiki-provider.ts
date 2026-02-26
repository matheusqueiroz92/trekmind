export interface WikiSearchResult {
  title: string;
  description?: string;
  extract?: string;
  url?: string;
  latitude?: number;
  longitude?: number;
}

export interface IWikiProvider {
  search(term: string): Promise<WikiSearchResult[]>;
  searchNearby(latitude: number, longitude: number, radiusKm?: number): Promise<WikiSearchResult[]>;
}
