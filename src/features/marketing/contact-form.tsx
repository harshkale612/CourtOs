"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(2, "Add a subject"),
  message: z.string().min(10, "Tell us a little more"),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Message sent!", { description: "We'll get back to you soon." });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-[var(--border-subtle)] bg-raised p-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-success/15 text-success">
          <Icon name="check-circle" className="size-7" />
        </span>
        <h3 className="mt-5 text-xl font-bold tracking-tight">Message sent</h3>
        <p className="mt-2 max-w-sm text-sm text-ink-secondary">
          Thanks for reaching out — we typically reply within a few hours.
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
        <div className="space-y-2">
          <Label>Name</Label>
          <Input placeholder="Your name" aria-invalid={!!errors.name} {...register("name")} />
          {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" placeholder="you@email.com" aria-invalid={!!errors.email} {...register("email")} />
          {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Subject</Label>
        <Input placeholder="How can we help?" aria-invalid={!!errors.subject} {...register("subject")} />
        {errors.subject && <p className="text-xs text-danger">{errors.subject.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Message</Label>
        <Textarea rows={5} placeholder="Your message…" aria-invalid={!!errors.message} {...register("message")} />
        {errors.message && <p className="text-xs text-danger">{errors.message.message}</p>}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
