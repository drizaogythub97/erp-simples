"use client";

import { Settings, Sliders, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    href: "/preferencias",
    label: "Preferências",
    description: "Tema, marca e taxas",
    Icon: Sliders,
  },
  {
    href: "/minha-conta",
    label: "Minha conta",
    description: "Dados pessoais e exclusão",
    Icon: User,
  },
] as const;

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Abrir configurações"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "size-12",
        )}
      >
        <Settings aria-hidden="true" className="size-5" />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Configurações"
          className="ring-foreground/10 bg-card text-card-foreground absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl ring-1 shadow-lg"
        >
          <ul className="flex flex-col">
            {ITEMS.map(({ href, label, description, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="hover:bg-muted focus-visible:bg-muted flex items-start gap-3 px-4 py-3 text-base outline-none"
                >
                  <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-foreground font-medium">{label}</span>
                    <span className="text-muted-foreground text-sm">
                      {description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
