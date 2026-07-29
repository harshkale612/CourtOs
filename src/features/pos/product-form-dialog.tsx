"use client";

import { useEffect, useState } from "react";
import type { Product, ProductCategory } from "@/types";
import { CATEGORY_LIST, DEFAULT_TAX_RATE, PRODUCT_CATEGORIES } from "@/lib/constants/pos";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateProduct, useUpdateProduct } from "./hooks";

interface FormState {
  name: string;
  category: ProductCategory;
  price: string;
  cost: string;
  taxRate: string;
  sku: string;
  barcode: string;
  stock: string;
  low: string;
  description: string;
  track: boolean;
}

function toForm(p?: Product): FormState {
  return {
    name: p?.name ?? "",
    category: p?.category ?? "beverages",
    price: p ? String(p.price) : "",
    cost: p?.cost != null ? String(p.cost) : "",
    taxRate: p ? String(p.taxRate) : String(DEFAULT_TAX_RATE),
    sku: p?.sku ?? "",
    barcode: p?.barcode ?? "",
    stock: p ? String(p.stock) : "0",
    low: p ? String(p.lowStockThreshold) : "6",
    description: p?.description ?? "",
    track: p ? p.trackInventory : true,
  };
}

/** Create or edit a catalog product. Pass `product` to edit; omit to create. */
export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product?: Product;
}) {
  const [form, setForm] = useState<FormState>(toForm(product));
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const editing = !!product;
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (open) setForm(toForm(product));
  }, [open, product]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const valid = form.name.trim().length > 0 && form.price !== "" && Number(form.price) >= 0;

  function submit() {
    if (!valid) return;
    const track = form.track;
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      sku: form.sku.trim() || `SKU-${form.name.slice(0, 3).toUpperCase()}`,
      barcode: form.barcode.trim() || undefined,
      price: Number(form.price) || 0,
      taxRate: Number(form.taxRate) || 0,
      cost: form.cost !== "" ? Number(form.cost) : undefined,
      stock: track ? Number(form.stock) || 0 : 0,
      lowStockThreshold: track ? Number(form.low) || 0 : 0,
      trackInventory: track,
      emoji: product?.emoji ?? PRODUCT_CATEGORIES[form.category].emoji,
    };

    if (editing && product) {
      update.mutate({ id: product.id, patch: payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      create.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update catalog details and pricing." : "Add a product to the pro-shop catalog."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Wilson US Open Balls" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v as ProductCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORY_LIST.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.emoji} {c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tax rate</Label>
              <Select value={form.taxRate} onValueChange={(v) => set("taxRate", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(DEFAULT_TAX_RATE)}>HST 13%</SelectItem>
                  <SelectItem value="0">Tax-free (0%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-price">Price (CAD)</Label>
              <Input id="p-price" type="number" min={0} step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-cost">Unit cost (CAD)</Label>
              <Input id="p-cost" type="number" min={0} step="0.01" value={form.cost} onChange={(e) => set("cost", e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-sku">SKU</Label>
              <Input id="p-sku" value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="Auto if blank" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-barcode">Barcode</Label>
              <Input id="p-barcode" value={form.barcode} onChange={(e) => set("barcode", e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-(--border-subtle) bg-surface px-3.5 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Track inventory</p>
              <p className="text-xs text-ink-tertiary">Off for services (coaching, passes).</p>
            </div>
            <Switch checked={form.track} onCheckedChange={(v) => set("track", v)} />
          </div>

          {form.track && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-stock">Stock on hand</Label>
                <Input id="p-stock" type="number" min={0} value={form.stock} onChange={(e) => set("stock", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-low">Low-stock alert at</Label>
                <Input id="p-low" type="number" min={0} value={form.low} onChange={(e) => set("low", e.target.value)} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional short description" className="min-h-20" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!valid || pending} onClick={submit}>
            <Icon name="check" className="size-4" /> {editing ? "Save changes" : "Add product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
