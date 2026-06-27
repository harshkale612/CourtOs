"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { ROLES } from "@/lib/constants/roles";
import { Logo } from "@/components/brand/logo";
import { GlowBlob } from "@/components/brand/glow-blob";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  ClubDetailsStep,
  CourtsStep,
  InviteStep,
  SkillStep,
  SportsStep,
  type WizardState,
} from "./steps";

interface StepDef {
  id: string;
  title: string;
  subtitle: string;
  valid: (s: WizardState) => boolean;
}

const OPERATOR_STEPS: StepDef[] = [
  { id: "club", title: "Tell us about your club", subtitle: "We'll use this to set up your space.", valid: (s) => s.clubName.trim().length > 1 },
  { id: "sports", title: "Which sports do you offer?", subtitle: "Pick all that apply — you can change this later.", valid: (s) => s.sports.length > 0 },
  { id: "courts", title: "Add your courts", subtitle: "Tap a sport to add courts. We've named them for you.", valid: (s) => s.courts.length > 0 },
  { id: "invite", title: "Invite your team", subtitle: "Bring your admins and coaches along. Optional.", valid: () => true },
];

const MEMBER_STEPS: StepDef[] = [
  { id: "sports", title: "What do you play?", subtitle: "We'll tailor your experience.", valid: (s) => s.sports.length > 0 },
  { id: "skill", title: "What's your level?", subtitle: "Helps us recommend the right events.", valid: (s) => s.skill.length > 0 },
];

export function OnboardingWizard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "owner";
  const isMember = role === "member";

  const steps = useMemo(() => (isMember ? MEMBER_STEPS : OPERATOR_STEPS), [isMember]);

  // phase: -1 welcome, 0..n-1 steps, n done
  const [phase, setPhase] = useState(-1);
  const [state, setState] = useState<WizardState>({
    clubName: "",
    location: "",
    sports: [],
    courts: [],
    invites: [],
    skill: "",
  });
  const update = (patch: Partial<WizardState>) => setState((prev) => ({ ...prev, ...patch }));

  const onWelcome = phase === -1;
  const onDone = phase === steps.length;
  const step = !onWelcome && !onDone ? steps[phase] : null;
  const canAdvance = step ? step.valid(state) : true;
  const progress = onWelcome ? 0 : onDone ? 100 : ((phase + 1) / (steps.length + 1)) * 100;

  const finish = () => {
    toast.success("You're all set! Welcome to CourtOS.");
    router.push(ROLES[role].home);
  };

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="mesh-bg absolute inset-0 -z-10" />
      <GlowBlob color="var(--accent-purple)" size={520} opacity={0.2} className="left-1/2 top-0 -translate-x-1/2" />

      {/* header */}
      <header className="flex items-center justify-between p-6">
        <Logo />
        {!onWelcome && !onDone && (
          <span className="text-sm text-ink-tertiary">
            Step {phase + 1} of {steps.length}
          </span>
        )}
        <button
          onClick={finish}
          className="text-sm text-ink-tertiary transition-colors hover:text-foreground"
        >
          {onDone ? "" : "Skip"}
        </button>
      </header>

      {/* progress */}
      {!onWelcome && (
        <div className="mx-auto w-full max-w-xl px-6">
          <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-grad-brand"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      )}

      {/* body */}
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={onWelcome ? "welcome" : onDone ? "done" : step!.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {onWelcome && <WelcomeStep name={user?.name} isMember={isMember} onStart={() => setPhase(0)} />}

              {step && (
                <div className="space-y-8">
                  <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{step.title}</h1>
                    <p className="text-ink-secondary">{step.subtitle}</p>
                  </div>
                  <div>
                    {step.id === "club" && <ClubDetailsStep state={state} update={update} />}
                    {step.id === "sports" && <SportsStep state={state} update={update} />}
                    {step.id === "courts" && <CourtsStep state={state} update={update} />}
                    {step.id === "invite" && <InviteStep state={state} update={update} />}
                    {step.id === "skill" && <SkillStep state={state} update={update} />}
                  </div>
                </div>
              )}

              {onDone && <DoneStep state={state} isMember={isMember} onFinish={finish} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* footer nav */}
      {!onWelcome && !onDone && (
        <footer className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 px-6 pb-10">
          <Button variant="ghost" onClick={() => setPhase((p) => p - 1)}>
            <Icon name="chevron-left" className="size-4" /> Back
          </Button>
          <Button onClick={() => setPhase((p) => p + 1)} disabled={!canAdvance}>
            {phase === steps.length - 1 ? "Finish setup" : "Continue"}
            <Icon name="arrow-right" className="size-4" />
          </Button>
        </footer>
      )}
    </div>
  );
}

function WelcomeStep({
  name,
  isMember,
  onStart,
}: {
  name?: string;
  isMember: boolean;
  onStart: () => void;
}) {
  const items = isMember
    ? ["Pick your sports", "Set your skill level", "Start booking courts"]
    : ["Set up your club", "Add courts & sports", "Invite your team"];
  return (
    <div className="text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-grad-brand text-3xl shadow-[var(--glow-brand)]">
        👋
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
        Welcome{name ? `, ${name.split(" ")[0]}` : ""}!
      </h1>
      <p className="mx-auto mt-3 max-w-md text-pretty text-ink-secondary">
        Let&apos;s get you set up in under a minute. Here&apos;s what we&apos;ll do:
      </p>
      <ul className="mx-auto mt-8 max-w-xs space-y-3 text-left">
        {items.map((item, i) => (
          <li key={item} className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-grad-brand-soft text-sm font-semibold text-brand">
              {i + 1}
            </span>
            <span className="text-sm text-foreground">{item}</span>
          </li>
        ))}
      </ul>
      <Button size="lg" className="mt-9" onClick={onStart}>
        Let&apos;s go <Icon name="arrow-right" className="size-4" />
      </Button>
    </div>
  );
}

function DoneStep({
  state,
  isMember,
  onFinish,
}: {
  state: WizardState;
  isMember: boolean;
  onFinish: () => void;
}) {
  return (
    <div className="text-center">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 20 }}
        className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-success/15 text-success"
      >
        <Icon name="check-circle" className="size-8" />
      </motion.span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">You&apos;re all set!</h1>
      <p className="mx-auto mt-3 max-w-md text-ink-secondary">
        {isMember
          ? "Your profile is ready. Time to book your first court."
          : `${state.clubName || "Your club"} is ready with ${state.courts.length} court${state.courts.length === 1 ? "" : "s"} across ${state.sports.length} sport${state.sports.length === 1 ? "" : "s"}.`}
      </p>
      <Button size="lg" className="mt-9" onClick={onFinish}>
        {isMember ? "Go to my dashboard" : "Open admin dashboard"}
        <Icon name="arrow-right" className="size-4" />
      </Button>
    </div>
  );
}
