import Image from "next/image";
import { SPORT_LIST } from "@/lib/constants/sports";
import { MARKETING_IMAGES } from "./content";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";

const TAGLINES: Record<string, string> = {
  tennis: "Clay, hard & grass",
  pickleball: "America's fastest-growing sport",
  padel: "Glass-walled & social",
  badminton: "Fast-paced indoor play",
  squash: "Four-wall intensity",
};

export function SportsShowcase() {
  return (
    <StaggerContainer className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {SPORT_LIST.map((sport) => (
        <StaggerItem key={sport.id} className="group">
          <div
            className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-[var(--border-subtle)] transition-all duration-300 group-hover:-translate-y-1"
            style={{ ["--sport-accent" as string]: sport.color }}
          >
            <Image
              src={MARKETING_IMAGES.sports[sport.id]}
              alt={`${sport.label} court`}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-canvas)] via-[var(--bg-canvas)]/40 to-transparent" />
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ boxShadow: `inset 0 0 0 2px ${sport.color}` }}
            />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <span className="text-2xl">{sport.emoji}</span>
              <h3 className="mt-1 font-semibold tracking-tight text-white">{sport.label}</h3>
              <p className="text-xs text-white/60">{TAGLINES[sport.id]}</p>
            </div>
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
