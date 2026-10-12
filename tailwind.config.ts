import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Exact Color Tokens Sampled Directly From Hero Frame Sequence
        hero: {
          void: "#080a10",       // Deep cinematic midnight ink base
          warm: "#f6602d",       // Warm fiery terracotta key light (from right cheek & rim)
          warmGlow: "#fe743d",   // Peak warm amber highlight
          warmMuted: "#ff915e",  // Soft warm peach highlight
          warmDeep: "#5a1f28",   // Deep wine terracotta shadow
          cool: "#3594bd",       // Steel azure rim light (from left cheek & temple)
          coolGlow: "#59c0dd",   // Peak azure highlight
          coolMuted: "#45abcb",  // Soft cyan tone
          coolDeep: "#0e203a",   // Deep midnight navy shadow
        },
      },
    },
  },
  plugins: [],
};
export default config;
