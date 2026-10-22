const steps = [
  {
    n: "01",
    title: "Choose your card",
    body: "Pick a material and finish, then add your name or logo. Every card is the standard wallet size.",
  },
  {
    n: "02",
    title: "Set up your destination",
    body: "Tell us what a tap should open: a website, digital business card, social profile, link-in-bio or contact details. We program and test the card before it ships.",
  },
  {
    n: "03",
    title: "Tap and share",
    body: "Hold the card near the top of a compatible phone. The link opens in the browser, with no app needed on their side.",
  },
];

export function Steps({ inverse = false }: { inverse?: boolean }) {
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {steps.map((s) => (
        <li
          key={s.n}
          className={`rounded-[var(--radius-card)] p-7 ${inverse ? "bg-night-2 shadow-[0_0_0_1px_rgba(255,255,255,0.07)]" : "bg-card shadow-[0_0_0_1px_var(--line)]"}`}
        >
          <span className="font-mono text-sm text-accent">{s.n}</span>
          <h3 className={`mt-8 text-xl font-semibold tracking-tight ${inverse ? "text-paper" : ""}`}>{s.title}</h3>
          <p className={`mt-3 leading-relaxed ${inverse ? "text-paper/60" : "text-muted"}`}>{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
