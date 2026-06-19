"use server";

import { createClient as createSbClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getServiceRoleKey, publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"fullName", string>>;
};

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  if (fullName.length < 2) {
    return {
      fieldErrors: { fullName: "Informe seu nome (mínimo 2 caracteres)." },
    };
  }
  if (fullName.length > 120) {
    return { fieldErrors: { fullName: "Nome muito longo (máx. 120)." } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const [profileResult, authResult] = await Promise.all([
    supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id),
    supabase.auth.updateUser({ data: { full_name: fullName } }),
  ]);

  if (profileResult.error || authResult.error) {
    return { error: "Não foi possível salvar." };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export type DeleteAccountResult = { ok: false; error: string };

/**
 * Em caso de erro retorna { ok: false, error }. Em caso de sucesso chama
 * `redirect("/")` (que lança NEXT_REDIRECT e nunca retorna).
 */
export async function deleteAccount(
  password: string,
): Promise<DeleteAccountResult | void> {
  if (!password || password.length === 0) {
    return { ok: false, error: "Informe sua senha para confirmar." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return { ok: false, error: "Sessão expirada. Entre novamente." };
  }
  const userId = user.id;
  const email = user.email;

  // Re-autentica para confirmar que é o próprio dono da conta.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    return { ok: false, error: "Senha incorreta." };
  }

  // Apaga eventuais arquivos do usuário no bucket de logos.
  // Path convention: <userId>/<uuid>.<ext>.
  const { data: files } = await supabase.storage
    .from("brand-logos")
    .list(userId);
  if (files && files.length > 0) {
    await supabase.storage
      .from("brand-logos")
      .remove(files.map((f) => `${userId}/${f.name}`));
  }

  // Apaga o usuário com service_role. O ON DELETE CASCADE em auth.users
  // remove profiles, products, product_barcodes, sales, sale_items e
  // preferences_fees automaticamente.
  const admin = createSbClient(
    publicEnv.supabaseUrl,
    getServiceRoleKey(),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    return { ok: false, error: "Não foi possível excluir a conta agora." };
  }

  await supabase.auth.signOut();
  redirect("/");
}
