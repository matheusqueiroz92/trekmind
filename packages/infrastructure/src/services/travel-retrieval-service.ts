import type { IRetrievalService } from "@trekmind/application";
import type { MCPToolsContext } from "../mcp/tools";
import { search_places, wikipedia_search } from "../mcp/tools";

export class TravelRetrievalService implements IRetrievalService {
  constructor(private context: MCPToolsContext) {}

  async getContext(
    question: string,
    location?: { latitude: number; longitude: number }
  ): Promise<string> {
    const parts: string[] = [];

    const lat = location?.latitude;
    const lng = location?.longitude;

    const placesResult = await search_places(
      {
        query: question,
        latitude: lat,
        longitude: lng,
        radiusKm: 15,
      },
      this.context
    );
    if (placesResult.places.length > 0) {
      parts.push(
        "Places found:",
        ...placesResult.places.map(
          (p) =>
            `- ${p.name} (${p.category}): ${p.description ?? "No description"} at ${p.latitude}, ${p.longitude}`
        )
      );
    }

    const wikiTerm = question.replace(/\?/g, "").trim();
    const wikiResult = await wikipedia_search(
      lat != null && lng != null
        ? { latitude: lat, longitude: lng, radiusKm: 15 }
        : { term: wikiTerm },
      this.context
    );
    if (wikiResult.results.length > 0) {
      parts.push(
        "Wikipedia:",
        ...wikiResult.results.map(
          (r) => `- ${r.title}: ${r.extract ?? r.description ?? ""} ${r.url ?? ""}`
        )
      );
    }

    if (parts.length === 0) {
      return "No relevant places or Wikipedia articles found for this query.";
    }
    return parts.join("\n");
  }
}
