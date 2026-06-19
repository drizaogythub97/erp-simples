"use client";

import {
  Boxes,
  LayoutDashboard,
  Package,
  Receipt,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Painel", Icon: LayoutDashboard },
  { href: "/caixa", label: "Caixa", Icon: ShoppingCart },
  { href: "/produtos", label: "Produtos", Icon: Package },
  { href: "/estoque", label: "Estoque", Icon: Boxes },
  { href: "/financeiro", label: "Financeiro", Icon: Receipt },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="border-border bg-background border-t"
    >
      <ul className="mx-auto flex w-full max-w-5xl flex-wrap items-stretch gap-1 px-2">
        {ITEMS.map(({ href, label, Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1 sm:flex-initial">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-14 min-w-[80px] items-center justify-center gap-2 rounded-md px-3 text-base font-medium transition-colors",
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
