import { z } from "zod";

export const placeCategoryEnum = z.enum([
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
]);

export const placeSourceEnum = z.enum(["wikipedia", "google"]);

export const placeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: placeCategoryEnum,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  source: placeSourceEnum.optional(),
  url: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  wikipediaTitle: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const placeCreateInputSchema = placeSchema.omit({ id: true }).partial({ metadata: true });
export const placeSearchQuerySchema = z.object({
  q: z.string().min(1).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().max(100).optional(),
  category: placeCategoryEnum.optional(),
  lang: z.string().min(1).optional(),
});

/** Query params for GET /api/places/search (q obrigatório). */
export const placesSearchQuerySchema = z.object({
  q: z.string().min(1).transform((s) => s.trim()).pipe(z.string().min(1)),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  lang: z.string().min(1).optional(),
});

/** Query params for GET /api/places/details (title obrigatório). */
export const placeDetailsQuerySchema = z.object({
  title: z.string().min(1).transform((s) => s.trim()).pipe(z.string().min(1)),
  lang: z.string().min(1).optional(),
});

/** Query params for GET /api/places/resolve. */
export const placeResolveQuerySchema = z.object({
  q: z.string().min(1).transform((s) => s.trim()).pipe(z.string().min(1)),
});

/** Query params for GET /api/places/by-category. */
export const placesByCategoryQuerySchema = z.object({
  q: z.string().min(1).transform((s) => s.trim()).pipe(z.string().min(1)),
  lang: z.string().min(1).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  categories: z
    .string()
    .optional()
    .transform((s) =>
      s ? s.split(",").map((c) => c.trim().toLowerCase()).filter(Boolean) : undefined
    ),
});

export type PlaceSchema = z.infer<typeof placeSchema>;
export type PlaceCategorySchema = z.infer<typeof placeCategoryEnum>;
export type PlaceSearchQuerySchema = z.infer<typeof placeSearchQuerySchema>;
export type PlacesSearchQuerySchema = z.infer<typeof placesSearchQuerySchema>;
export type PlaceDetailsQuerySchema = z.infer<typeof placeDetailsQuerySchema>;
export type PlaceResolveQuerySchema = z.infer<typeof placeResolveQuerySchema>;
export type PlacesByCategoryQuerySchema = z.infer<typeof placesByCategoryQuerySchema>;
