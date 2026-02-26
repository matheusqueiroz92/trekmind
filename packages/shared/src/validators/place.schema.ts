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
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  category: placeCategoryEnum,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  source: placeSourceEnum.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const placeCreateInputSchema = placeSchema.omit({ id: true }).partial({ metadata: true });
export const placeSearchQuerySchema = z.object({
  q: z.string().min(1).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().max(100).optional(),
  category: placeCategoryEnum.optional(),
});

export type PlaceSchema = z.infer<typeof placeSchema>;
export type PlaceCategorySchema = z.infer<typeof placeCategoryEnum>;
export type PlaceSearchQuerySchema = z.infer<typeof placeSearchQuerySchema>;
