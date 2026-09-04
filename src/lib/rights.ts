/**
 * Content rights registry.
 * Every asset used by the app must have an entry here. Nothing with a status
 * other than PUBLISHED is allowed to reach the child experience.
 */

export type RightsStatus = "DRAFT" | "RIGHTS REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";

export interface RightsRecord {
  id: string;
  title: string;
  creator: string;
  source: string;
  url: string;
  license: string;
  copyright: string;
  commercialUse: boolean | "unknown";
  modification: boolean | "unknown";
  attributionRequired: boolean;
  attributionText?: string;
  verified: string;
  proofUrl?: string;
  reviewBy?: string;
  status: RightsStatus;
  referenceOnly?: boolean;
  notes?: string;
}

export const RIGHTS_RECORDS: RightsRecord[] = [
  {
    id: "orig-characters",
    title: "Totland characters (Bramble Bear, Fern Fox, Dot, Bolt, Ollie)",
    creator: "Totland Studio (in-house)",
    source: "Original",
    url: "internal://totland/characters",
    license: "Proprietary — owned outright",
    copyright: "© Totland Studio",
    commercialUse: true,
    modification: true,
    attributionRequired: false,
    verified: "2026-09-04",
    status: "PUBLISHED",
    notes: "Original designs; no resemblance to third-party characters.",
  },
  {
    id: "orig-curriculum",
    title: "Letter, number, color, shape and 200+ first-word curriculum",
    creator: "Totland Studio (in-house)",
    source: "Original",
    url: "internal://totland/curriculum",
    license: "Proprietary — owned outright",
    copyright: "© Totland Studio",
    commercialUse: true,
    modification: true,
    attributionRequired: false,
    verified: "2026-09-04",
    status: "PUBLISHED",
  },
  {
    id: "orig-stories",
    title: "Beginner storybook set (5 shipped, 20 in production)",
    creator: "Totland Studio (in-house)",
    source: "Original",
    url: "internal://totland/stories",
    license: "Proprietary — owned outright",
    copyright: "© Totland Studio",
    commercialUse: true,
    modification: true,
    attributionRequired: false,
    verified: "2026-09-04",
    status: "PUBLISHED",
  },
  {
    id: "fonts-baloo-nunito",
    title: "Baloo 2 & Nunito Sans typefaces",
    creator: "Ek Type / Vernon Adams et al.",
    source: "Google Fonts",
    url: "https://fonts.google.com/specimen/Baloo+2",
    license: "SIL Open Font License 1.1",
    copyright: "© respective foundries",
    commercialUse: true,
    modification: true,
    attributionRequired: false,
    verified: "2026-09-04",
    proofUrl: "https://openfontlicense.org/",
    status: "PUBLISHED",
    notes: "OFL permits commercial embedding in apps.",
  },
  {
    id: "unicode-emoji",
    title: "System emoji glyphs used as placeholder illustration",
    creator: "Platform vendor (Apple/Google)",
    source: "Operating system font",
    url: "https://unicode.org/emoji/",
    license: "Rendered by the OS — not redistributed",
    copyright: "Vendor artwork stays with the vendor",
    commercialUse: true,
    modification: false,
    attributionRequired: false,
    verified: "2026-09-04",
    status: "APPROVED",
    notes: "Placeholder only — replace with original illustration before store submission.",
  },
  {
    id: "ref-openclipart-set",
    title: "Assorted preschool clipart set",
    creator: "Various contributors",
    source: "Third-party clipart site",
    url: "https://example.org/clipart-set",
    license: "Unclear / mixed uploads",
    copyright: "Cannot be verified per-item",
    commercialUse: "unknown",
    modification: "unknown",
    attributionRequired: false,
    verified: "2026-09-04",
    status: "RIGHTS REVIEW",
    referenceOnly: true,
    notes: "Reference only. Provenance of individual uploads not verifiable — do not ship.",
  },
  {
    id: "ref-nc-phonics",
    title: "Phonics worksheet pack (CC BY-NC)",
    creator: "Independent educator",
    source: "Teacher resource marketplace",
    url: "https://example.org/phonics-pack",
    license: "CC BY-NC 4.0",
    copyright: "© creator",
    commercialUse: false,
    modification: true,
    attributionRequired: true,
    verified: "2026-09-04",
    status: "RIGHTS REVIEW",
    referenceOnly: true,
    notes: "Non-commercial licence blocks use in a paid subscription app.",
  },
];

export const shippableRecords = () => RIGHTS_RECORDS.filter((r) => r.status === "PUBLISHED" && !r.referenceOnly);
export const blockedRecords = () => RIGHTS_RECORDS.filter((r) => r.status === "RIGHTS REVIEW" || r.referenceOnly);
