import { z } from "zod";

const emailSchema = z.string().email("Informe um e-mail válido.");

export const userRegisterSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  email: emailSchema,
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres.").optional(),
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe a senha."),
});

export const magicLinkEmailSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
});

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.coerce.date().optional(),
});

export type UserRegisterSchema = z.infer<typeof userRegisterSchema>;
export type UserLoginSchema = z.infer<typeof userLoginSchema>;
export type MagicLinkEmailSchema = z.infer<typeof magicLinkEmailSchema>;
export type UserResponseSchema = z.infer<typeof userResponseSchema>;
