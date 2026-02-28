import { Place } from "@trekmind/domain";
import type { Location } from "@trekmind/domain";
import type { PlaceRepository } from "@trekmind/application";
import { WikipediaGateway } from "../gateways/wikipedia-gateway";

export class ExternalPlaceRepository implements PlaceRepository {
  constructor(private wikipedia = new WikipediaGateway()) {}

  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    _category?: string,
    lang?: string
  ): Promise<Place[]> {
    const results = await this.wikipedia.searchNearby(
      latitude,
      longitude,
      radiusKm,
      lang
    );
    return results.map((r, i) =>
      Place.reconstitute({
        id: `wiki-${r.title.replace(/\s/g, "-")}-${i}`,
        name: r.title,
        description: r.description ?? r.extract,
        category: "other",
        latitude: r.latitude ?? latitude,
        longitude: r.longitude ?? longitude,
        url: r.url,
        imageUrl: r.thumbnailUrl,
        wikipediaTitle: r.title,
        source: "wikipedia",
        createdAt: new Date(),
      })
    );
  }

  async searchByQuery(
    query: string,
    location?: Location | null,
    lang?: string
  ): Promise<Place[]> {
    const results = await this.wikipedia.search(query, lang);
    const coords = location?.getCoordinates();
    const lat = coords?.latitude ?? 0;
    const lng = coords?.longitude ?? 0;
    return results.map((r, i) =>
      Place.reconstitute({
        id: `wiki-${r.title.replace(/\s/g, "-")}-${i}`,
        name: r.title,
        description: r.extract,
        category: "other",
        latitude: lat,
        longitude: lng,
        url: r.url,
        imageUrl: r.thumbnailUrl,
        wikipediaTitle: r.title,
        source: "wikipedia",
        createdAt: new Date(),
      })
    );
  }
}
