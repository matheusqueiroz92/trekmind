import type { PlaceRepository } from "@trekmind/application";
import type { IWikiProvider } from "@trekmind/application";
import { GetNearbyPlacesUseCase } from "@trekmind/application";
import { SearchPlacesUseCase } from "@trekmind/application";

export interface MCPToolsContext {
  placeRepository: PlaceRepository;
  wikiProvider: IWikiProvider;
  geocodingService: { getCoordinatesFromAddress(address: string): Promise<{ latitude: number; longitude: number } | null> } | null;
}

export interface UserLocationPayload {
  latitude?: number;
  longitude?: number;
}

/** Tool: get_user_location - returns the user's current coordinates (from client payload). */
export async function get_user_location(
  params: UserLocationPayload,
  _context: MCPToolsContext
): Promise<{ latitude: number; longitude: number } | { error: string }> {
  if (params.latitude != null && params.longitude != null) {
    return { latitude: params.latitude, longitude: params.longitude };
  }
  return { error: "User location not provided. Ask the user to share their location or enter a city/address." };
}

/** Tool: search_places - search for places by query and optional location. */
export async function search_places(
  params: { query: string; latitude?: number; longitude?: number; radiusKm?: number },
  context: MCPToolsContext
): Promise<{ places: Array<{ name: string; description?: string; category: string; latitude: number; longitude: number }> }> {
  const { placeRepository, geocodingService } = context;
  const radiusKm = params.radiusKm ?? 10;

  if (params.latitude != null && params.longitude != null) {
    const useCase = new GetNearbyPlacesUseCase(placeRepository);
    const list = await useCase.execute({
      latitude: params.latitude,
      longitude: params.longitude,
      radiusKm,
    });
    return {
      places: list.map((p) => ({
        name: p.name,
        description: p.description,
        category: p.category,
        latitude: p.latitude,
        longitude: p.longitude,
      })),
    };
  }

  const searchUseCase = new SearchPlacesUseCase(placeRepository, geocodingService);
  const list = await searchUseCase.execute({ query: params.query });
  return {
    places: list.map((p) => ({
      name: p.name,
      description: p.description,
      category: p.category,
      latitude: p.latitude,
      longitude: p.longitude,
    })),
  };
}

/** Tool: wikipedia_search - search Wikipedia by term or by coordinates. */
export async function wikipedia_search(
  params: { term?: string; latitude?: number; longitude?: number; radiusKm?: number },
  context: MCPToolsContext
): Promise<{ results: Array<{ title: string; description?: string; extract?: string; url?: string }> }> {
  const { wikiProvider } = context;

  if (params.term) {
    const list = await wikiProvider.search(params.term);
    return {
      results: list.map((r) => ({
        title: r.title,
        description: r.description,
        extract: r.extract,
        url: r.url,
      })),
    };
  }

  if (params.latitude != null && params.longitude != null) {
    const list = await wikiProvider.searchNearby(
      params.latitude,
      params.longitude,
      params.radiusKm ?? 10
    );
    return {
      results: list.map((r) => ({
        title: r.title,
        description: r.description,
        extract: r.extract,
        url: r.url,
      })),
    };
  }

  return { results: [] };
}

export const MCP_TOOL_DEFINITIONS = [
  {
    name: "get_user_location",
    description: "Get the user's current location (latitude and longitude). Call this when you need to know where the user is to suggest nearby places. Input can be provided by the client.",
    inputSchema: {
      type: "object" as const,
      properties: {
        latitude: { type: "number", description: "User's latitude" },
        longitude: { type: "number", description: "User's longitude" },
      },
    },
  },
  {
    name: "search_places",
    description: "Search for places (tourist spots, restaurants, museums, etc.) by query and optional coordinates. Use when the user asks for recommendations or 'where to go'.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query (e.g. 'museums', 'restaurants', 'beaches')" },
        latitude: { type: "number", description: "Optional center latitude" },
        longitude: { type: "number", description: "Optional center longitude" },
        radiusKm: { type: "number", description: "Optional radius in km (default 10)" },
      },
      required: ["query"],
    },
  },
  {
    name: "wikipedia_search",
    description: "Search Wikipedia for information about a place or get nearby Wikipedia articles by coordinates. Use to ground answers with factual content.",
    inputSchema: {
      type: "object" as const,
      properties: {
        term: { type: "string", description: "Search term (e.g. city name, landmark)" },
        latitude: { type: "number", description: "Optional center latitude for nearby search" },
        longitude: { type: "number", description: "Optional center longitude for nearby search" },
        radiusKm: { type: "number", description: "Optional radius in km for nearby search" },
      },
    },
  },
] as const;
