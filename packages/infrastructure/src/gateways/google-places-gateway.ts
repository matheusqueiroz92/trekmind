import type { PlaceDTO } from "@trekmind/application";
import type {
  IPlacesByCategoryProvider,
  PlaceCategoryType,
  SearchByCategoryRequest,
} from "@trekmind/application";

const PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const FIELDS =
  "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.photos";

type PlaceResponse = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  photos?: Array<{ name?: string }>;
};

type SearchTextResponse = {
  places?: PlaceResponse[];
};

export class GooglePlacesGateway implements IPlacesByCategoryProvider {
  constructor(private apiKey: string | undefined) {}

  async searchByCategory(request: SearchByCategoryRequest): Promise<PlaceDTO[]> {
    const key = this.apiKey?.trim();
    if (!key) return [];

    const query =
      request.query?.trim() ||
      (request.latitude != null && request.longitude != null
        ? `${request.latitude},${request.longitude}`
        : "");
    if (!query) return [];

    const body: Record<string, unknown> = {
      textQuery: query,
      includedType: request.category,
      pageSize: 15,
    };
    if (request.lang) body.languageCode = request.lang;
    if (
      request.latitude != null &&
      request.longitude != null &&
      request.query
    ) {
      body.locationBias = {
        circle: {
          center: {
            latitude: request.latitude,
            longitude: request.longitude,
          },
          radius: 50000,
        },
      };
    }

    try {
      const res = await fetch(PLACES_SEARCH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": FIELDS,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) return [];
      const data = (await res.json()) as SearchTextResponse;
      const places = data.places ?? [];
      return places.map((p, i) => toPlaceDTO(p, request.category, key, i));
    } catch {
      return [];
    }
  }
}

function toPlaceDTO(
  p: PlaceResponse,
  category: PlaceCategoryType,
  apiKey: string,
  index: number
): PlaceDTO {
  const id = p.id ?? `google-${index}-${Date.now()}`;
  const lat = p.location?.latitude ?? 0;
  const lng = p.location?.longitude ?? 0;
  const name = p.displayName?.text ?? "Sem nome";
  let imageUrl: string | undefined;
  const firstPhoto = p.photos?.[0]?.name;
  if (firstPhoto) {
    imageUrl = `https://places.googleapis.com/v1/${firstPhoto}/media?key=${encodeURIComponent(apiKey)}&maxHeightPx=400`;
  }
  return {
    id,
    name,
    description: undefined,
    category,
    latitude: lat,
    longitude: lng,
    address: p.formattedAddress,
    source: "google",
    url: undefined,
    imageUrl,
    createdAt: new Date(),
  };
}
