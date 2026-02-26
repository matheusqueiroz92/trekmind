import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");

export const userRegisterSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters"),
  email: emailSchema,
  password: z.string().min(8, "Password must have at least 8 characters").optional(),
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.coerce.date().optional(),
});

export type UserRegisterSchema = z.infer<typeof userRegisterSchema>;
export type UserLoginSchema = z.infer<typeof userLoginSchema>;
export type UserResponseSchema = z.infer<typeof userResponseSchema>;
