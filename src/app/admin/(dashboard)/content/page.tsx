import { Suspense } from "react";
import { getContent } from "./actions";
import ContentStudio from "./ContentStudio";

export const metadata = { title: "Content Studio" };
export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const [heroContent, aboutContent, achievementsContent, educationContent, contactContent] =
    await Promise.all([
      getContent("hero"),
      getContent("about"),
      getContent("achievements"),
      getContent("education"),
      getContent("contact"),
    ]);

  return (
    <Suspense fallback={<div className="p-8 text-sm text-[var(--a-text-subtle)]">Loading Content Studio...</div>}>
      <ContentStudio
        initialContent={{
          hero: heroContent || {},
          about: aboutContent || {},
          achievements: achievementsContent || {},
          education: educationContent || {},
          contact: contactContent || {},
        }}
      />
    </Suspense>
  );
}
