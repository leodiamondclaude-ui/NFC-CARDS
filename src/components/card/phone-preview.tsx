import { GlobeIcon, MailIcon, PhoneIcon, CameraIcon } from "@/components/ui/icons";

/**
 * A phone showing the kind of page a tap opens. Illustrative only: the
 * profile below is sample content, not a real person. Sized in container
 * units so it scales cleanly at any width.
 */
export function PhonePreview({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-full ${className}`}
      style={{ containerType: "inline-size" }}
      role="img"
      aria-label="Phone showing a sample digital profile opened by tapping the card"
    >
      <div className="relative aspect-[9/18.5] w-full rounded-[15cqw] bg-night p-[2.6cqw] shadow-[0_40px_80px_-30px_rgba(12,12,14,0.55),0_0_0_1px_rgba(255,255,255,0.06)_inset]">
        <div className="relative h-full w-full overflow-hidden rounded-[12.5cqw] bg-paper">
          <div className="absolute left-1/2 top-[3.5cqw] z-10 h-[7.5cqw] w-[30cqw] -translate-x-1/2 rounded-full bg-night" />
          <div className="h-[26%] bg-[linear-gradient(160deg,#1b1b1e,#0c0c0e)] pt-[14cqw] text-center font-mono text-[3.6cqw] tracking-wide text-paper/55">
            tapcard.example/alex
          </div>
          <div className="-mt-[13cqw] px-[6.5cqw]">
            <div className="grid h-[26cqw] w-[26cqw] place-items-center rounded-full border-[1.6cqw] border-paper bg-accent text-[8cqw] font-semibold text-accent-ink">
              AR
            </div>
            <div className="mt-[3cqw] text-[7.2cqw] font-semibold tracking-tight">Alex Rivera</div>
            <div className="text-[4.8cqw] text-muted">Founder, Rivera Studio</div>
            <div className="mt-[5cqw] grid grid-cols-3 gap-[2.5cqw]">
              {[
                { icon: PhoneIcon, label: "Call" },
                { icon: MailIcon, label: "Email" },
                { icon: GlobeIcon, label: "Website" },
              ].map(({ icon: I, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-[1.5cqw] rounded-[4cqw] bg-card py-[3.5cqw] text-[4cqw] text-ink-2 shadow-[0_0_0_1px_var(--line)]"
                >
                  <I className="h-[6.5cqw] w-[6.5cqw]" />
                  {label}
                </div>
              ))}
            </div>
            <div className="mt-[2.5cqw] rounded-[4cqw] bg-ink py-[3.5cqw] text-center text-[4.4cqw] font-medium text-paper">
              Save contact
            </div>
            <div className="mt-[3.5cqw] space-y-[2cqw]">
              {["Portfolio", "Book a call"].map((l) => (
                <div
                  key={l}
                  className="flex items-center justify-between rounded-[4cqw] bg-card px-[4cqw] py-[3cqw] text-[4.3cqw] shadow-[0_0_0_1px_var(--line)]"
                >
                  {l}
                  <span className="text-muted">→</span>
                </div>
              ))}
              <div className="flex items-center gap-[2.5cqw] rounded-[4cqw] bg-card px-[4cqw] py-[3cqw] text-[4.3cqw] shadow-[0_0_0_1px_var(--line)]">
                <CameraIcon className="h-[5cqw] w-[5cqw]" /> @riverastudio
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
