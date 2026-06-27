"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 700));
    setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-success/15 text-success">
          <Icon name="mail" className="size-7" />
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Check your inbox</h1>
          <p className="text-sm text-ink-secondary">
            We sent a reset link to <span className="text-foreground">{getValues("email")}</span>. It
            expires in 30 minutes.
          </p>
        </div>
        <Button variant="secondary" className="w-full" asChild>
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
        <p className="text-sm text-ink-secondary">
          Enter your email and we&apos;ll send you a secure reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@club.com" aria-invalid={!!errors.email} {...register("email")} />
          {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-sm text-ink-secondary transition-colors hover:text-foreground"
      >
        <Icon name="chevron-left" className="size-4" /> Back to sign in
      </Link>
    </div>
  );
}
