export interface CRMTemplate {
  id: string;
  name: string;
  category: "initial" | "proposal" | "followup" | "meeting" | "closing";
  subject: string;
  body: string;
}

export const CRM_TEMPLATES: CRMTemplate[] = [
  {
    id: "initial_response",
    name: "Initial Response & Discovery Intro",
    category: "initial",
    subject: "Thanks for reaching out to Zakaria — Next steps for {company}",
    body: `Hi {name},

Thank you for reaching out! I reviewed your details regarding {company} and would love to help you build a high-performance online experience.

As a specialist in custom Shopify theme development, Liquid engineering, and high-converting modern web design, I focus on crafting stores that look exceptional and deliver measurable revenue results.

To make sure we're completely aligned on scope and timeline, could you share a bit more about:
1. Your target launch timeline?
2. Are you looking for a completely custom build from scratch or optimizing an existing store?
3. Any reference stores whose design or functionality you admire?

If you prefer a quick 15-minute discovery call, you can also let me know a day/time that works best for you.

Looking forward to hearing your thoughts!

Best regards,
Zakaria Bin Moti
Shopify & Full-Stack Web Developer
contact@hellozakaria.com | https://hellozakaria.com`,
  },
  {
    id: "shopify_proposal",
    name: "Shopify Proposal & Scope Overview",
    category: "proposal",
    subject: "Custom Shopify Proposal & Architecture Scope — {company}",
    body: `Hi {name},

Great speaking with you about your vision for {company}. Based on our discussion, I have prepared a comprehensive breakdown of how we can build your new store:

🎯 Project Goals:
• High-converting, bespoke Shopify theme engineered with clean Liquid & modern UX
• Lightning-fast page load speeds (90+ mobile PageSpeed score)
• Seamless mobile responsiveness and conversion-optimized checkout flow
• Custom sections tailored to your brand identity

💰 Commercials:
• Estimated Project Investment: {budget}
• Target Delivery: 2-3 weeks from kickoff

Please let me know if this aligns with your expectations, or if you'd like to adjust any features. Once approved, I will send over our agreement and project timeline so we can get started right away.

Best regards,
Zakaria Bin Moti
Shopify & Full-Stack Web Developer
contact@hellozakaria.com`,
  },
  {
    id: "follow_up_nudge",
    name: "Gentle Follow-Up Nudge",
    category: "followup",
    subject: "Quick follow-up regarding your project for {company}",
    body: `Hi {name},

I wanted to quickly follow up on my previous message regarding {company}'s store development.

I know how busy things get when running a business, so no worries at all! Just wanted to see if you had any questions about the proposal, timeline, or scope we discussed?

I'm currently booking projects for the coming month and want to make sure I reserve availability for you if you're still looking to move forward.

Let me know what works best for your schedule!

Best regards,
Zakaria Bin Moti
Shopify & Full-Stack Web Developer`,
  },
  {
    id: "meeting_confirmation",
    name: "Discovery Meeting Confirmation",
    category: "meeting",
    subject: "Confirmed: Discovery & Technical Audit Session with Zakaria",
    body: `Hi {name},

Our discovery call is confirmed!

Here are the details for our session:
• Topic: Store audit & development roadmap for {company}
• Video Link: Google Meet / Zoom link attached

Ahead of our call, I'll take a close look at your store and come prepared with specific UX and technical recommendations.

Looking forward to speaking with you!

Best regards,
Zakaria Bin Moti
Shopify & Full-Stack Web Developer`,
  },
  {
    id: "project_kickoff",
    name: "Project Kickoff & Onboarding",
    category: "closing",
    subject: "Welcome aboard! Kickoff & Next Steps for {company}",
    body: `Hi {name},

Welcome aboard! I'm thrilled to be partnering with you to bring {company}'s new store to life.

Here is what we need to get started:
1. Shopify Collaborator Access (I will send a request from my partner account)
2. Brand Assets (Logos, high-res photos, typography, and color codes)
3. Any specific third-party app integrations you plan to use

I've already begun setting up your staging environment and will share our interactive progress board with you soon.

Let's build something extraordinary!

Best regards,
Zakaria Bin Moti
Shopify & Full-Stack Web Developer`,
  },
];

export function fillTemplateVariables(
  template: CRMTemplate,
  lead: {
    name?: string;
    company?: string;
    email?: string;
    projectBudget?: string;
    estimatedValue?: number;
    projectType?: string;
  }
) {
  const name = lead.name || "there";
  const company = lead.company || lead.name || "your business";
  const budget = lead.estimatedValue
    ? `$${lead.estimatedValue.toLocaleString()}`
    : lead.projectBudget || "Agreed Scope";

  const replaceMap: Record<string, string> = {
    "{name}": name,
    "{company}": company,
    "{budget}": budget,
    "{email}": lead.email || "",
  };

  let subject = template.subject;
  let body = template.body;

  Object.entries(replaceMap).forEach(([key, val]) => {
    subject = subject.replaceAll(key, val);
    body = body.replaceAll(key, val);
  });

  return { subject, body };
}
