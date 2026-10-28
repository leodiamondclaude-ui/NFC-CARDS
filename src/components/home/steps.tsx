const steps = [
  {
    n: "01",
    title: "Choose Your Card",
    body: "Pick the card that fits you, from the Essential card to a fully custom design or a pack for your team.",
  },
  {
    n: "02",
    title: "Set Up Your Profile",
    body: "Tell us the web address your card should open, such as your website or a digital profile. Setup steps depend on the card you choose, and each product page explains what's included.",
  },
  {
    n: "03",
    title: "Tap and Share",
    body: "Hold the card near a compatible phone and your page opens in the browser. Most recent phones support NFC, but not every phone does.",
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
