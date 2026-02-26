import { z } from "zod";

export const latLongSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const locationSchema = z
  .object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    radiusKm: z.number().positive().max(100).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasCoords = data.latitude != null && data.longitude != null;
      const hasAddress = data.address ?? data.city ?? data.country;
      return hasCoords || !!hasAddress;
    },
    { message: "Provide either coordinates (latitude/longitude) or address/city/country" }
  );

export type LocationSchema = z.infer<typeof locationSchema>;
export type LatLongSchema = z.infer<typeof latLongSchema>;
