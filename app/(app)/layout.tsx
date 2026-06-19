import Link from "next/link";
import { redirect } from "next/navigation";

import { AppNav } from "@/components/app/app-nav";
import { LogoutButton } from "@/components/app/logout-button";
import { SettingsMenu } from "@/components/app/settings-menu";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("brand_name, brand_logo_path")
    .eq("id", user.id)
    .maybeSingle();

  const brandName =
    (profile?.brand_name as string | null) ?? "ERP Simples";
  const logoPath = profile?.brand_logo_path as string | null;
  const logoUrl = logoPath
    ? supabase.storage.from("brand-logos").getPublicUrl(logoPath).data.publicUrl
    : null;

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ?? user.email;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border bg-background border-b">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4">
          <Link
            href="/dashboard"
            className="text-foreground flex items-center gap-3 text-xl font-semibold tracking-tight"
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                className="size-10 rounded-md object-cover"
              />
            ) : null}
            <span>{brandName}</span>
          </Link>
          <div className="flex items-center gap-2">
            <span
              className="text-muted-foreground hidden text-base sm:inline"
              aria-label="Usuário conectado"
            >
              {displayName}
            </span>
            <SettingsMenu />
            <LogoutButton />
          </div>
        </div>
        <AppNav />
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
