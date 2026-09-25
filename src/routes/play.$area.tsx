import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AREAS } from "@/lib/content";

const AREA_SEO: Record<string, { title: string; description: string }> = {
  letters: {
    title: "Phonics Games & ABC Games for Kids Ages 2–6 — Totland",
    description:
      "Free phonics games and ABC games for kids: find letters, hear each letter sound aloud, and build letter recognition with short, ad-free toddler learning games.",
  },
  phonics: {
    title: "Beginning Sounds Phonics Games for Preschoolers — Totland",
    description:
      "Phonics games that start with the ear: hear the first sound, pick the matching picture, and build early reading skills with spoken prompts and gentle feedback.",
  },
  tracing: {
    title: "Letter Tracing Games — ABC Tracing Practice for Kids — Totland",
    description:
      "Letter tracing games for ages 2–6: trace capital and lowercase letters with a finger, hear each letter name, and build handwriting skills before the pencil.",
  },
};

export const Route = createFileRoute("/play/$area")({
  head: ({ params }) => {
    const areaMeta = AREAS.find((a) => a.id === params.area) ?? AREAS[0]!;
    const areaTitle = typeof areaMeta.title === "string" ? areaMeta.title : "Play & Learn";
    const seo = AREA_SEO[params.area];
    const title = seo?.title ?? `${areaTitle} — Totland`;
    const description =
      seo?.description ??
      `${areaTitle} activities for toddlers and preschoolers: short, playful toddler learning games with instant, encouraging feedback.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `https://totland.app/play/${params.area}` },
        { property: "og:image", content: "https://totland.app/og-image.jpg" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: "https://totland.app/og-image.jpg" },
      ],
      links: [{ rel: "canonical", href: `https://totland.app/play/${params.area}` }],
    };
  },
  component: PlayAreaLayout,
});

function PlayAreaLayout() {
  return <Outlet />;
}
