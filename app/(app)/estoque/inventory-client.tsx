"use client";

import { Box, Pencil, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOW_STOCK_THRESHOLD } from "@/lib/dashboard/dates";
import { formatBRL, formatQuantity } from "@/lib/products/format";
import type { Product } from "@/lib/types/db";
import { cn } from "@/lib/utils";

type Props = { products: Product[] };

export function InventoryClient({ products }: Props) {
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);

  const filtered = useMemo(() => {
    const term = name.trim().toLowerCase();
    const fromDate = parseDate(from);
    const toDate = parseDate(to, true);
    const minN = minQty === "" ? null : Number(minQty.replace(",", "."));
    const maxN = maxQty === "" ? null : Number(maxQty.replace(",", "."));

    return products.filter((p) => {
      if (term && !p.name.toLowerCase().includes(term)) return false;
      const created = new Date(p.created_at).getTime();
      if (fromDate && created < fromDate.getTime()) return false;
      if (toDate && created > toDate.getTime()) return false;
      if (minN !== null && Number.isFinite(minN)) {
        if (!p.track_stock || (p.stock_quantity ?? 0) < minN) return false;
      }
      if (maxN !== null && Number.isFinite(maxN)) {
        if (!p.track_stock || (p.stock_quantity ?? 0) > maxN) return false;
      }
      if (onlyLow) {
        if (!p.track_stock) return false;
        if ((p.stock_quantity ?? 0) > LOW_STOCK_THRESHOLD) return false;
      }
      return true;
    });
  }, [products, name, from, to, minQty, maxQty, onlyLow]);

  function clearFilters() {
    setName("");
    setFrom("");
    setTo("");
    setMinQty("");
    setMaxQty("");
    setOnlyLow(false);
  }

  const hasFilters =
    name !== "" ||
    from !== "" ||
    to !== "" ||
    minQty !== "" ||
    maxQty !== "" ||
    onlyLow;

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="ring-foreground/10 bg-card flex flex-col gap-4 rounded-xl p-5 ring-1">
        <legend className="text-lg font-semibold">Filtros</legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-name" className="text-base">
              Nome
            </Label>
            <Input
              id="filter-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: refrigerante"
              className="h-12 text-base"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-from" className="text-base">
              Cadastrado a partir de
            </Label>
            <Input
              id="filter-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-12 text-base"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-to" className="text-base">
              Cadastrado até
            </Label>
            <Input
              id="filter-to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-12 text-base"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-min" className="text-base">
              Quantidade mínima
            </Label>
            <Input
              id="filter-min"
              type="text"
              inputMode="decimal"
              value={minQty}
              onChange={(e) => setMinQty(e.target.value)}
              placeholder="Ex.: 1"
              className="h-12 text-base"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-max" className="text-base">
              Quantidade máxima
            </Label>
            <Input
              id="filter-max"
              type="text"
              inputMode="decimal"
              value={maxQty}
              onChange={(e) => setMaxQty(e.target.value)}
              placeholder={`Ex.: ${LOW_STOCK_THRESHOLD}`}
              className="h-12 text-base"
            />
          </div>
          <div className="flex items-end">
            <label className="border-border bg-background hover:bg-muted flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border px-4 text-base font-medium transition-colors">
              <input
                type="checkbox"
                checked={onlyLow}
                onChange={(e) => setOnlyLow(e.target.checked)}
                className="size-5 accent-current"
              />
              Só estoque baixo (≤ {LOW_STOCK_THRESHOLD})
            </label>
          </div>
        </div>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-primary self-start text-base font-medium underline underline-offset-4 hover:no-underline"
          >
            Limpar filtros
          </button>
        ) : null}
      </fieldset>

      <p
        className="text-muted-foreground text-base"
        aria-live="polite"
      >
        {filtered.length} de {products.length}{" "}
        {products.length === 1 ? "produto" : "produtos"}.
      </p>

      <ProductsTable products={filtered} />
    </div>
  );
}

function ProductsTable({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="bg-muted/40 rounded-xl p-8 text-center">
        <p className="text-base">Nenhum produto bateu com os filtros.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {products.map((p) => (
          <li
            key={p.id}
            className="ring-foreground/10 bg-card flex flex-col gap-2 rounded-xl p-4 ring-1"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-foreground text-lg font-semibold">
                {p.name}
              </span>
              <StockChip product={p} />
            </div>
            <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-base">
              <span className="text-foreground font-medium">
                {formatBRL(p.price)}
              </span>
              {p.barcode ? (
                <span className="font-mono">{p.barcode}</span>
              ) : null}
            </div>
            <Link
              href={`/produtos/${p.id}/editar`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "mt-2 h-11 text-base",
              )}
            >
              <Pencil aria-hidden="true" className="size-4" />
              Editar
            </Link>
          </li>
        ))}
      </ul>

      <div className="ring-foreground/10 hidden overflow-hidden rounded-xl ring-1 md:block">
        <table className="w-full border-collapse text-base">
          <thead className="bg-muted/60">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Produto</th>
              <th className="px-4 py-3 text-left font-semibold">Código</th>
              <th className="px-4 py-3 text-right font-semibold">Preço</th>
              <th className="px-4 py-3 text-left font-semibold">Estoque</th>
              <th className="px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr
                key={p.id}
                className={cn(
                  "border-border border-t",
                  i % 2 === 1 ? "bg-muted/20" : undefined,
                )}
              >
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="text-muted-foreground px-4 py-3 font-mono">
                  {p.barcode ?? "—"}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">
                  {formatBRL(p.price)}
                </td>
                <td className="px-4 py-3">
                  <StockChip product={p} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/produtos/${p.id}/editar`}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-10 px-3 text-sm",
                    )}
                    aria-label={`Editar ${p.name}`}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StockChip({ product }: { product: Product }) {
  if (!product.track_stock) {
    return (
      <span
        className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800"
        aria-label="Produto sob demanda"
      >
        <UtensilsCrossed aria-hidden="true" className="size-4" />
        Sob demanda
      </span>
    );
  }

  const qty = product.stock_quantity ?? 0;
  const low = qty <= LOW_STOCK_THRESHOLD;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
        low
          ? "bg-warning/15 text-warning"
          : "bg-primary/10 text-primary",
      )}
      aria-label={`Estoque ${formatQuantity(qty)}${low ? ", baixo" : ""}`}
    >
      <Box aria-hidden="true" className="size-4" />
      {low ? "Baixo: " : ""}
      {formatQuantity(qty)}
    </span>
  );
}

function parseDate(value: string, endOfDay = false): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  if (endOfDay) date.setHours(23, 59, 59, 999);
  return date;
}
