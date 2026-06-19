import { z } from "zod";

import { parseDecimalPtBR } from "@/lib/products/format";

const name = z
  .string()
  .trim()
  .min(1, "Informe o nome do produto.")
  .max(120, "Nome muito longo (máx. 120 caracteres).");

const barcode = z
  .string()
  .trim()
  .max(64, "Código de barras muito longo.")
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

const priceField = z
  .string()
  .min(1, "Informe o preço.")
  .transform((v, ctx) => {
    const n = parseDecimalPtBR(v);
    if (!Number.isFinite(n)) {
      ctx.addIssue({ code: "custom", message: "Preço inválido." });
      return z.NEVER;
    }
    if (n < 0) {
      ctx.addIssue({
        code: "custom",
        message: "O preço não pode ser negativo.",
      });
      return z.NEVER;
    }
    return Math.round(n * 100) / 100;
  });

const stockField = z
  .string()
  .optional()
  .transform((v, ctx) => {
    if (v === undefined || v.trim() === "") return null;
    const n = parseDecimalPtBR(v);
    if (!Number.isFinite(n)) {
      ctx.addIssue({ code: "custom", message: "Quantidade inválida." });
      return z.NEVER;
    }
    if (n < 0) {
      ctx.addIssue({
        code: "custom",
        message: "A quantidade não pode ser negativa.",
      });
      return z.NEVER;
    }
    return n;
  });

export const productSchema = z
  .object({
    name,
    barcode,
    price: priceField,
    trackStock: z.enum(["true", "false"], {
      error: "Escolha se controla estoque.",
    }),
    stockQuantity: stockField,
  })
  .superRefine((data, ctx) => {
    if (data.trackStock === "true" && data.stockQuantity === null) {
      ctx.addIssue({
        code: "custom",
        path: ["stockQuantity"],
        message: "Informe a quantidade em estoque.",
      });
    }
  });

export type ProductInput = z.infer<typeof productSchema>;
