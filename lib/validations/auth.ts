import { z } from "zod";

const email = z.email("Digite um e-mail válido.");

const password = z
  .string()
  .min(8, "A senha deve ter ao menos 8 caracteres.")
  .max(72, "A senha é muito longa.");

const fullName = z
  .string()
  .min(2, "Informe seu nome completo.")
  .max(120, "Nome muito longo.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Informe a senha."),
});

export const signupSchema = z.object({
  fullName,
  email,
  password,
  privacyAccepted: z.literal("on", {
    error: "Você precisa aceitar a Política de Privacidade.",
  }),
});

export const recoverSchema = z.object({
  email,
});

export const resetSchema = z
  .object({
    password,
    passwordConfirm: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "As senhas não coincidem.",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type RecoverInput = z.infer<typeof recoverSchema>;
export type ResetInput = z.infer<typeof resetSchema>;
