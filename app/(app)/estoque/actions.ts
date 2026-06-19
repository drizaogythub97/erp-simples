"use server";

import { revalidatePath } from "next/cache";

import { parseDecimalPtBR } from "@/lib/products/format";
import { createClient } from "@/lib/supabase/server";

export type StockUpdateResult = {
  ok: boolean;
  error?: string;
};

export async function updateStock(
  formData: FormData,
): Promise<StockUpdateResult> {
  const id = String(formData.get("id") ?? "");
  const mode = String(formData.get("mode") ?? "");
  const rawQty = String(formData.get("quantity") ?? "");

  if (!id) return { ok: false, error: "Produto inválido." };
  if (mode !== "set" && mode !== "add") {
    return { ok: false, error: "Modo inválido." };
  }

  const qty = parseDecimalPtBR(rawQty);
  if (!Number.isFinite(qty) || qty < 0) {
    return { ok: false, error: "Quantidade inválida." };
  }
  if (mode === "add" && qty === 0) {
    return { ok: false, error: "Informe a quantidade que chegou." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada." };

  const { data: current, error: readError } = await supabase
    .from("products")
    .select("stock_quantity, track_stock")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (readError || !current) {
    return { ok: false, error: "Produto não encontrado." };
  }
  if (!current.track_stock) {
    return {
      ok: false,
      error: "Este produto não controla estoque.",
    };
  }

  const newQty =
    mode === "set"
      ? qty
      : Math.round(((current.stock_quantity ?? 0) + qty) * 1000) / 1000;

  const { error: updError } = await supabase
    .from("products")
    .update({
      stock_quantity: newQty,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updError) {
    return { ok: false, error: "Não foi possível atualizar." };
  }

  revalidatePath("/estoque");
  revalidatePath("/dashboard");
  return { ok: true };
}
