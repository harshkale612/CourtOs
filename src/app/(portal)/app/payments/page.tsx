"use client";

import { useState } from "react";
import type { PaymentMethod } from "@/types";
import { formatCurrency, formatLongDate } from "@/lib/utils/format";
import { PAYMENT_STATUS } from "@/lib/constants/statuses";
import { useSessionUser } from "@/features/auth/use-session-user";
import {
  usePaymentMethods,
  useTransactions,
  useAddPaymentMethod,
  useRemovePaymentMethod,
} from "@/features/payments/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const BRAND_COLOR: Record<string, string> = {
  visa: "#1A1F71", mastercard: "#EB001B", amex: "#006FCF", discover: "#FF6000",
};

export default function PaymentsPage() {
  const user = useSessionUser();
  const { data: methods, isLoading } = usePaymentMethods(user.id);
  const { data: transactions } = useTransactions(user.id);
  const addMethod = useAddPaymentMethod(user.id);
  const removeMethod = useRemovePaymentMethod(user.id);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ number: "", exp: "", brand: "visa" as PaymentMethod["brand"] });

  const submit = () => {
    const last4 = form.number.replace(/\D/g, "").slice(-4) || "0000";
    const [m, y] = form.exp.split("/");
    addMethod.mutate(
      {
        userId: user.id,
        brand: form.brand,
        last4,
        expMonth: parseInt(m) || 12,
        expYear: 2000 + (parseInt(y) || 28),
        isDefault: (methods ?? []).length === 0,
      },
      { onSuccess: () => { setOpen(false); setForm({ number: "", exp: "", brand: "visa" }); } },
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Payments</h1>
        <p className="mt-1 text-ink-secondary">Manage your cards and review payment history.</p>
      </div>

      {/* payment methods */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Payment methods</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Icon name="plus" className="size-4" /> Add card</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add a payment method</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Card number</Label>
                  <Input placeholder="4242 4242 4242 4242" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry (MM/YY)</Label>
                    <Input placeholder="08/28" value={form.exp} onChange={(e) => setForm({ ...form, exp: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>CVC</Label>
                    <Input placeholder="123" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit} disabled={addMethod.isPending}>{addMethod.isPending ? "Adding…" : "Add card"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <Skeleton className="h-16 w-full rounded-2xl" />
          ) : (
            (methods ?? []).map((m) => (
              <div key={m.id} className="flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-surface p-4">
                <span className="flex h-9 w-12 items-center justify-center rounded-md text-xs font-bold uppercase text-white" style={{ background: BRAND_COLOR[m.brand] }}>
                  {m.brand.slice(0, 4)}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">•••• {m.last4}</p>
                  <p className="text-xs text-ink-tertiary">Expires {String(m.expMonth).padStart(2, "0")}/{m.expYear}</p>
                </div>
                {m.isDefault && <Badge tone="info">Default</Badge>}
                <Button variant="ghost" size="icon" onClick={() => removeMethod.mutate(m.id)} aria-label="Remove card">
                  <Icon name="x" className="size-4 text-ink-tertiary" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* history */}
      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Payment history</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="hidden sm:table-cell">Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(transactions ?? []).slice(0, 12).map((t) => {
              const status = PAYMENT_STATUS[t.status];
              return (
                <TableRow key={t.id}>
                  <TableCell className="text-foreground">{formatLongDate(t.createdAt)}</TableCell>
                  <TableCell className="capitalize">{t.type}</TableCell>
                  <TableCell className="hidden sm:table-cell">{t.method}</TableCell>
                  <TableCell><Badge tone={status.tone}>{status.label}</Badge></TableCell>
                  <TableCell className="tnum text-right font-medium text-foreground">{formatCurrency(t.amount)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
