import { getContent } from "./actions";
import ContentForm from "./ContentForm";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const heroContent = await getContent("hero") || {};
  const aboutContent = await getContent("about") || {};

  return (
    <div className="max-w-4xl space-y-12">
      <h1 className="text-3xl font-bold mb-8">Manage Content</h1>
      
      <ContentForm
        section="hero"
        title="Hero Section"
        initialData={heroContent}
        fields={[
          { name: "headline", label: "Headline" },
          { name: "subheadline", label: "Subheadline", rows: 2 },
          { name: "supporting", label: "Supporting Text", rows: 3 },
        ]}
      />

      <ContentForm
        section="about"
        title="About Section"
        initialData={aboutContent}
        fields={[
          { name: "p1", label: "Paragraph 1", rows: 2 },
          { name: "p2", label: "Paragraph 2", rows: 2 },
          { name: "p3", label: "Paragraph 3", rows: 2 },
          { name: "p4", label: "Paragraph 4", rows: 2 },
        ]}
      />
    </div>
  );
}
