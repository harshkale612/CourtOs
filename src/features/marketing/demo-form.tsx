"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { SPORT_LIST } from "@/lib/constants/sports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  club: z.string().min(2, "Please enter your club name"),
  sport: z.string().min(1, "Select a primary sport"),
  courts: z.string().min(1, "Select club size"),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function DemoForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    await new Promise((r) => setTimeout(r, 900));
    toast.success("Demo request received!", { description: "We'll reach out within one business day." });
    setSubmitted(true);
    void values;
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-[var(--border-subtle)] bg-raised p-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-success/15 text-success">
          <Icon name="check-circle" className="size-7" />
        </span>
        <h3 className="mt-5 text-xl font-bold tracking-tight">You&apos;re all set!</h3>
        <p className="mt-2 max-w-sm text-sm text-ink-secondary">
          Thanks for your interest in CourtOS. A product specialist will email you shortly to
          schedule your personalized walkthrough.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl border border-[var(--border-subtle)] bg-raised p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" error={errors.name?.message}>
          <Input placeholder="Anna Lee" aria-invalid={!!errors.name} {...register("name")} />
        </Field>
        <Field label="Work email" error={errors.email?.message}>
          <Input type="email" placeholder="anna@club.com" aria-invalid={!!errors.email} {...register("email")} />
        </Field>
      </div>

      <Field label="Club name" error={errors.club?.message}>
        <Input placeholder="Riverside Racquet Club" aria-invalid={!!errors.club} {...register("club")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Primary sport" error={errors.sport?.message}>
          <Select onValueChange={(v) => setValue("sport", v, { shouldValidate: true })} value={watch("sport")}>
            <SelectTrigger aria-invalid={!!errors.sport}>
              <SelectValue placeholder="Select a sport" />
            </SelectTrigger>
            <SelectContent>
              {SPORT_LIST.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.emoji} {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Number of courts" error={errors.courts?.message}>
          <Select onValueChange={(v) => setValue("courts", v, { shouldValidate: true })} value={watch("courts")}>
            <SelectTrigger aria-invalid={!!errors.courts}>
              <SelectValue placeholder="Club size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-4">1–4 courts</SelectItem>
              <SelectItem value="5-10">5–10 courts</SelectItem>
              <SelectItem value="11-20">11–20 courts</SelectItem>
              <SelectItem value="20+">20+ courts</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Anything we should know? (optional)">
        <Textarea placeholder="Tell us about your club and what you're looking for…" {...register("message")} />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Request my demo"}
        {!isSubmitting && <Icon name="arrow-right" className="size-4" />}
      </Button>
      <p className="text-center text-xs text-ink-tertiary">
        We&apos;ll never share your details. No credit card required.
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-danger">
          <Icon name="circle-alert" className="size-3" />
          {error}
        </p>
      )}
    </div>
  );
}
