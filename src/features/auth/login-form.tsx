"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { useAuthActions } from "./use-auth-actions";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const { login, quickDemo } = useAuthActions();
  const [showPw, setShowPw] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "anna@example.com", password: "demo123" } });

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values);
    } catch {
      toast.error("Couldn't sign in. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-ink-secondary">Sign in to your CourtOS account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@club.com" aria-invalid={!!errors.email} {...register("email")} />
          {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-ink-secondary transition-colors hover:text-brand">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary transition-colors hover:text-foreground"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              <Icon name={showPw ? "eye-off" : "eye"} className="size-4" />
            </button>
          </div>
          {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--border-subtle)]" />
        <span className="text-xs text-ink-tertiary">or explore a demo</span>
        <span className="h-px flex-1 bg-[var(--border-subtle)]" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => quickDemo("member")}>
          <Icon name="user" className="size-4" /> Member demo
        </Button>
        <Button variant="secondary" onClick={() => quickDemo("owner")}>
          <Icon name="layout-dashboard" className="size-4" /> Admin demo
        </Button>
      </div>

      <p className="text-center text-sm text-ink-secondary">
        New to CourtOS?{" "}
        <Link href="/signup" className="font-medium text-foreground transition-colors hover:text-brand">
          Create an account
        </Link>
      </p>
    </div>
  );
}
