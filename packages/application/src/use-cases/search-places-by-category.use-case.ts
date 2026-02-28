import type {
  IPlacesByCategoryProvider,
  PlaceCategoryType,
  PlacesByCategoryResult,
} from "./services/places-by-category-provider";

export interface SearchPlacesByCategoryRequest {
  query?: string;
  latitude?: number;
  longitude?: number;
  categories: PlaceCategoryType[];
  lang?: string;
}

const ALL_CATEGORIES: PlaceCategoryType[] = [
  "restaurant",
  "lodging",
  "tourist_attraction",
  "bar",
];

export class SearchPlacesByCategoryUseCase {
  constructor(private provider: IPlacesByCategoryProvider) {}

  async execute(request: SearchPlacesByCategoryRequest): Promise<PlacesByCategoryResult> {
    const categories =
      request.categories.length > 0
        ? request.categories.filter((c) =>
            ALL_CATEGORIES.includes(c)
          )
        : ALL_CATEGORIES;

    const results = await Promise.all(
      categories.map((category) =>
        this.provider.searchByCategory({
          query: request.query,
          latitude: request.latitude,
          longitude: request.longitude,
          category,
          lang: request.lang,
        })
      )
    );

    const result: PlacesByCategoryResult = {
      restaurant: [],
      lodging: [],
      tourist_attraction: [],
      bar: [],
    };

    categories.forEach((category, index) => {
      result[category] = results[index] ?? [];
    });

    return result;
  }
}
