import { shipping, site } from "@/config/site";

/**
 * Marketing copy shared across pages. Answers marked `configurable` depend
 * on business decisions (lead times, policies, pricing); review them before
 * launch.
 */

export type Faq = { q: string; a: string; configurable?: boolean };

export const faqs: Faq[] = [
  {
    q: "What is an NFC business card?",
    a: "It's a business card with a small NFC (near-field communication) chip inside. When someone holds their phone near it, the phone opens a link, such as your website or a digital profile, so they get your details without typing anything.",
  },
  {
    q: "How does an NFC card work?",
    a: "The chip stores a web address. A compatible phone held within a few centimeters powers the chip and reads that address, then opens it in the browser. The card has no battery and only shares what's stored on it, only when tapped.",
  },
  {
    q: "Do I need an app to use an NFC card?",
    a: "No. Most NFC-enabled phones open the link without an app. The person you share with doesn't need anything installed. We set up your card before it ships, so there's nothing to install on your side either.",
  },
  {
    q: "Does the card work with every smartphone?",
    a: "No. Most recent iPhones and many Android phones can read NFC, but support varies by model and settings. Some Android phones need NFC switched on, and some older or budget phones don't have NFC at all. Keeping your details printed on the card means it still works as a regular business card.",
  },
  {
    q: "Can I customize my card?",
    a: "Yes. The Custom NFC Card lets you add a printed name, job title, company and logo. Available options are shown on each product page, and we only offer options we can produce.",
  },
  {
    q: "Can I update the information connected to my card?",
    a: "If your card points to a page you control, like your website or a digital profile, you can change that page any time and the card keeps working. Changing the link stored on the card itself depends on the card and how it was set up.",
  },
  {
    q: "How long does shipping take?",
    a: `Our current estimate is ${shipping.productionDays.standard[0]}–${shipping.productionDays.standard[1]} business days to prepare standard cards and ${shipping.productionDays.custom[0]}–${shipping.productionDays.custom[1]} for custom designs, plus shipping time for the method you choose. You'll see an estimate before you pay.`,
    configurable: true,
  },
  {
    q: "Do you offer bulk discounts?",
    a: `Yes, for teams and larger orders. Request a quote on the For Business page or email ${site.contact.salesEmail}, and we'll reply with options for your quantity.`,
    configurable: true,
  },
  {
    q: "What is your return policy?",
    a: "Unused, non-personalized cards can be returned within the period listed on our returns page. Personalized cards are made to order and can be replaced if they arrive damaged or defective. See the returns policy for details.",
    configurable: true,
  },
];

export const useCases = [
  { id: "entrepreneurs", title: "Entrepreneurs", body: "Turn every introduction into a lasting connection with your site, portfolio or booking page one tap away." },
  { id: "sales", title: "Sales Professionals", body: "Share your contact details and calendar instantly, so follow-ups start before the conversation ends." },
  { id: "real-estate", title: "Real Estate Agents", body: "Send clients to your listings and contact page from an open house, a showing or a coffee meeting." },
  { id: "creators", title: "Creators", body: "Grow your audience in person. One tap opens your link-in-bio, channel or media kit." },
  { id: "small-business", title: "Small Businesses", body: "Give your team a consistent, professional card that points customers to the right place." },
];

export const benefits = [
  { id: "sharing", title: "Instant Sharing", body: "Share your professional information with a simple tap." },
  { id: "reusable", title: "Reusable", body: "Update your digital information without needing to print new cards." },
  { id: "professional", title: "Professional", body: "Make networking easier with a clean, modern business card." },
  { id: "paper", title: "Less Paper", body: "Reduce the need to repeatedly print traditional business cards." },
];

/**
 * SAMPLE testimonials, shown with a visible "Sample" label. Replace them with
 * genuine customer feedback (with permission) before launch, then set
 * `isSample: false`. Never present samples as real reviews.
 */
export const testimonials = {
  isSample: true,
  items: [
    { quote: "Your customer's words about their first networking event with the card go here.", name: "Customer name", role: "Role, Company" },
    { quote: "A short quote about how easy it was to share contact details with clients.", name: "Customer name", role: "Role, Company" },
    { quote: "Feedback from a team or business order, such as consistent branding across staff.", name: "Customer name", role: "Role, Company" },
  ],
};
