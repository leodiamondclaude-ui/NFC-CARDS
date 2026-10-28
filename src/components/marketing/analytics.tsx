"use client";

import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";
import { analytics, site } from "@/config/site";
import { addSink, consentStore, writeConsent } from "@/lib/analytics";
import { onCartAdd } from "@/lib/cart-store";
import { track } from "@/lib/analytics";

type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;

/**
 * Loads Google Analytics and/or Meta Pixel only when their IDs are set
 * (NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_META_PIXEL_ID) and the visitor accepts.
 * With no IDs configured, this renders nothing and no banner is shown.
 */
export function Analytics() {
  const configured = Boolean(analytics.gaId || analytics.metaPixelId);
  const consent = useSyncExternalStore(consentStore.subscribe, consentStore.get, consentStore.getServer);

  useEffect(() => {
    return onCartAdd((line) => track({ name: "add_to_cart", slug: line.slug, variantId: line.variantId, quantity: line.quantity }));
  }, []);

  useEffect(() => {
    if (consent !== "granted") return;
    return addSink((e) => {
      const w = window as unknown as { gtag?: Gtag; fbq?: Fbq };
      w.gtag?.("event", e.name, e);
      if (e.name === "add_to_cart") w.fbq?.("track", "AddToCart");
      if (e.name === "begin_checkout") w.fbq?.("track", "InitiateCheckout", { value: e.value / 100, currency: site.currency.toUpperCase() });
      if (e.name === "generate_lead") w.fbq?.("track", "Lead");
    });
  }, [consent]);

  if (!configured || consent === "unknown") return null;

  return (
    <>
      {consent === "granted" && analytics.gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${analytics.gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(analytics.gaId)});`}
          </Script>
        </>
      )}
      {consent === "granted" && analytics.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(analytics.metaPixelId)});fbq('track','PageView');`}
        </Script>
      )}
      {consent === null && (
        <div role="dialog" aria-label="Cookie preferences" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-2xl border border-line bg-card p-5 shadow-xl sm:left-6 sm:right-auto">
          <p className="text-sm leading-relaxed text-ink-2">
            We use optional analytics cookies to understand how the store is used. You can accept or decline; the store works either way.
          </p>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => writeConsent("granted")} className="h-9 rounded-full bg-ink px-4 text-sm font-medium text-paper">
              Accept
            </button>
            <button type="button" onClick={() => writeConsent("denied")} className="h-9 rounded-full border border-line-strong px-4 text-sm font-medium">
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  );
}
