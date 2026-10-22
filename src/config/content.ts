import { shipping, site } from "@/config/site";

/** Marketing copy shared across pages. Kept here so it is easy to edit. */

export type Faq = { q: string; a: string; group: "NFC basics" | "Setup" | "Orders" };

export const faqs: Faq[] = [
  {
    group: "NFC basics",
    q: "What is NFC?",
    a: "NFC (near-field communication) is a short-range wireless standard built into most modern smartphones. When a phone comes within a few centimeters of an NFC chip, it can read a small amount of data from it, such as a web link. It's the same family of technology used for contactless payments, but our cards only store links or contact data. They can't make or receive payments.",
  },
  {
    group: "NFC basics",
    q: "Which phones support NFC?",
    a: "iPhone XS and newer can read NFC tags in the background: just hold the top of the phone near the card. iPhone 7 through X can read tags through the NFC reader in Control Center. Most mid-range and flagship Android phones support NFC, though it may need to be switched on in Settings. Coverage varies by model and region, so if someone's phone can't read the card, the printed details (or a QR code on custom designs) still work.",
  },
  {
    group: "NFC basics",
    q: "Does the card need a battery or charging?",
    a: "No. NFC cards are passive: the phone's NFC field powers the chip for the moment it's being read. There's nothing to charge.",
  },
  {
    group: "NFC basics",
    q: "Does the person tapping need an app?",
    a: "No. For links, the phone opens the page in its browser with no app required. The person you're sharing with only needs NFC turned on.",
  },
  {
    group: "Setup",
    q: "How does programming work?",
    a: "You choose a destination when you order, such as a website, a digital business card or a social profile. We write it to the chip and test the card before it ships, so it works the moment it arrives. You don't need any special hardware.",
  },
  {
    group: "Setup",
    q: "Can the card be reprogrammed?",
    a: "Yes. Our chips are rewritable unless you ask us to lock them. You can rewrite an unlocked card yourself with a free NFC writing app on a compatible phone. Locking prevents anyone from overwriting the card, but it's permanent.",
  },
  {
    group: "Setup",
    q: "Can I change where my card points later?",
    a: "It depends on the destination. If your card points to a page you control, like your website, a link-in-bio page or a digital business card, you can change that page's content any time without touching the card. If you want the card itself to open a different link, you'll need to rewrite it (if it isn't locked). We recommend pointing your card to a page you can edit.",
  },
  {
    group: "Orders",
    q: "How long does shipping take?",
    a: `Standard cards are produced in ${shipping.productionDays.standard[0]}–${shipping.productionDays.standard[1]} business days and custom designs in ${shipping.productionDays.custom[0]}–${shipping.productionDays.custom[1]} business days, after proof approval. Shipping time depends on the method you choose at checkout. You'll see the estimate before you pay.`,
  },
  {
    group: "Orders",
    q: "What's your return policy?",
    a: `Unused standard cards can be returned within ${shipping.returnsWindowDays} days. Because personalized cards are made to order, they can only be returned if they arrive damaged or don't work. We'll replace or refund them. See the returns policy for details.`,
  },
  {
    group: "Orders",
    q: "Do you offer bulk orders for teams?",
    a: `Yes. The Business Team Pack covers small teams, and for 25 cards or more we offer volume pricing, consistent company branding and per-employee setup. Request a quote on the Business page or email ${site.contact.salesEmail}.`,
  },
];

export const useCases = [
  {
    id: "networking",
    title: "Networking",
    body: "Swap details in a second, without paper cards or spelling out your email. Your contact page is always current.",
  },
  {
    id: "real-estate",
    title: "Real estate",
    body: "Send clients to your listings, booking calendar or reviews from an open house, a showing or a sign.",
  },
  {
    id: "social",
    title: "Social media",
    body: "Turn a meeting into a follow. One tap opens your Instagram, TikTok or link-in-bio page.",
  },
  {
    id: "small-business",
    title: "Small businesses",
    body: "Put a key tag at the counter that opens your menu, your review page or your loyalty sign-up.",
  },
  {
    id: "events",
    title: "Events and conferences",
    body: "Give speakers and staff branded cards that open schedules, decks or lead forms.",
  },
];
