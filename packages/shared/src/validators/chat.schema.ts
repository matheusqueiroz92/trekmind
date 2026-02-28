import { z } from "zod";

/** Body para POST /api/chat */
export const chatRequestBodySchema = z.object({
  message: z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.string().min(1, "Envie uma mensagem.")
  ),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export type ChatRequestBodySchema = z.infer<typeof chatRequestBodySchema>;
