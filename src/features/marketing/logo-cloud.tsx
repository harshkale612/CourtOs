import { LOGOS } from "./content";

export function LogoCloud() {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-ink-tertiary">
          Trusted by leading clubs worldwide
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
          {LOGOS.map((logo) => (
            <span
              key={logo}
              className="text-lg font-bold tracking-tight text-ink-secondary transition-colors hover:text-foreground"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
