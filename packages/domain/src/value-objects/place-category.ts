export const PLACE_CATEGORIES = [
  "restaurant",
  "museum",
  "beach",
  "trail",
  "hotel",
  "lodging",
  "bar",
  "nightlife",
  "park",
  "waterfall",
  "river",
  "shopping",
  "club",
  "water_park",
  "other",
] as const;

export type PlaceCategoryType = (typeof PLACE_CATEGORIES)[number];

export class PlaceCategory {
  private constructor(private readonly value: PlaceCategoryType) {}

  static create(category: string): PlaceCategory {
    const normalized = category.toLowerCase().trim();
    if (!PLACE_CATEGORIES.includes(normalized as PlaceCategoryType)) {
      return new PlaceCategory("other");
    }
    return new PlaceCategory(normalized as PlaceCategoryType);
  }

  getValue(): PlaceCategoryType {
    return this.value;
  }

  equals(other: PlaceCategory): boolean {
    return this.value === other.value;
  }
}
