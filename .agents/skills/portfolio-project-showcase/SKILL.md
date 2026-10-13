---
name: portfolio-project-showcase
description: >-
  Use this skill whenever the user provides a website URL to add as a portfolio project,
  or asks to add, showcase, or generate a showcase image for a website (especially Shopify or
  eCommerce storefronts). Captures real multi-device screenshots (Desktop, Tablet, Mobile),
  composes a professional 16:9 studio mockup canvas, extracts project business info & tech stack,
  uploads the image to Cloudinary, and saves the project to MongoDB.
---

# Portfolio Project Showcase Workflow

This skill standardizes the end-to-end pipeline for converting a client website into a top-tier featured portfolio project in Zakaria's Portfolio.

Whenever the user provides a website URL (e.g. `https://suitshark.ca/`) to add to their portfolio, you must execute the exact multi-device capture, composition, upload, and database update process defined below.

---

## Strict Rules & Principles

1. **Brand Name Accuracy**:
   - Verify the exact brand capitalization and spacing (e.g., "Suitshark", NOT "Suit Shark").
   - Maintain the single-word / official brand formatting across title, description, tags, and badges.

2. **Zero Fake / AI Images**:
   - **NEVER** use AI image generators (`generate_image`) to fabricate fake websites or hallucinated mockups.
   - **ALWAYS** capture 100% genuine screenshots of the live website across Desktop, Tablet, and Mobile viewports using `browser_subagent`.

3. **Multi-Device Studio Showcase (16:9 Canvas)**:
   - Present the project on a dark luxury studio canvas (`1920x1080` or 16:9 aspect ratio) with three device mockups:
     - **PC / Laptop (Center-Left / Back)**: MacBook Pro / Studio Display frame with macOS window header (🔴 🟡 🟢) and padlock URL bar showing the desktop landing page / hero banner.
     - **Tablet (Center-Right / Middle)**: iPad Pro frame showing a key interactive feature, custom configurator, collection grid, or product page.
     - **Mobile (Foreground-Right / Floating)**: iPhone 15 Pro frame with Dynamic Island and iOS status bar (`9:41`) showing the responsive mobile storefront.
   - Clean luxury backdrop: `#05070C` to `#080B13` with subtle cyan/champagne ambient lighting, studio floor glow, and deep multi-layered drop shadows.
   - Floating feature pill badges (e.g., "⚡ Bespoke Configurator", "Mobile Storefront").
   - Bottom highlight metrics (e.g., "1+ Years Continuous Retainer", key engine highlight, localization/market).

4. **Widget & Chat Icon Sanitation**:
   - Always crop or patch out floating third-party widgets (e.g., UserWay accessibility icons, Shopify Inbox / Tidio / Zendesk chat bubbles) from all screenshots before embedding them into device frames.

---

## Step-by-Step Execution Runbook

### Step 1: Discover & Capture Live Storefront (Multi-Device)
Use `browser_subagent` to navigate to the target URL:
1. **Desktop View (`1920x1080`)**:
   - Dismiss any newsletter popup, cookie banner, or region modal.
   - Smoothly scroll down so all lazy-loaded imagery renders.
   - Capture the desktop landing page (Header, navigation, search, and hero photography).
2. **Key Feature / Product / Tablet View (`804x1005` or tablet viewport)**:
   - Navigate to the most complex, bespoke, or unique feature of the site (e.g. custom product bundle configurator, advanced filter collection, sizing calculator).
   - Capture the feature in portrait or landscape tablet view.
3. **Mobile View (`390x844` or `500x800`)**:
   - Switch to mobile viewport.
   - Capture the responsive mobile view (hamburger menu, brand logo, search bar, and hero photography).

### Step 2: Crop Clean Screens with Sharp
Use Node.js with `sharp` to extract clean, widget-free crops:
- **Desktop**: Extract top `1904x1080` (16:9 ratio) from the landing page.
- **Tablet**: Crop out bottom chat widget (height ~870px).
- **Mobile**: Crop cleanly right after the hero image (height ~628px).

### Step 3: Render the 1920x1080 Studio Canvas
1. Populate `resources/mockup_template.html` (or write a temporary canvas HTML) with:
   - `{{BRAND_NAME}}`: e.g. "Suitshark"
   - `{{SITE_URL}}`: e.g. "https://suitshark.ca/"
   - `{{TAG_ACCENT}}`, `{{TAG_2}}`, `{{TAG_3}}`: e.g. "⚡ Bespoke 3-Piece Suiting Configurator", "Shopify Architecture", "Responsive Multi-Device UX"
   - `{{DESKTOP_IMG_URL}}`, `{{TABLET_IMG_URL}}`, `{{MOBILE_IMG_URL}}`
   - `{{STAT_1_VAL}}`, `{{STAT_1_LABEL}}`, `{{STAT_2_VAL}}`, `{{STAT_2_LABEL}}`, `{{STAT_3_VAL}}`, `{{STAT_3_LABEL}}`
2. Open the canvas in the browser at viewport `1920x1080`.
3. Capture a full-viewport screenshot of the 1920x1080 canvas using `browser_subagent`.

### Step 4: Upload to Cloudinary
Upload the 1920x1080 studio showcase screenshot to Cloudinary using credentials from `.env.local`:
- Folder: `portfolio`
- Public ID: `<brand_slug>_showcase_<timestamp>`

### Step 5: Update MongoDB Database
Connect to MongoDB Atlas using `MONGODB_URI` from `.env.local`.
> **CRITICAL (Windows DNS Fix)**:
> In Node.js on Windows, always execute `dns.setServers(['8.8.8.8', '1.1.1.1'])` before calling `mongoose.connect()` to prevent `querySrv ECONNREFUSED` errors.

Upsert the project record in the `Project` collection:
```typescript
{
  title: "<Brand> - <Subtitle>",
  description: "<Engineered highlights, custom code features, retainer duration, tech details>",
  techStack: ["Shopify", "Liquid", "Custom Logic", "JavaScript", ...],
  liveLink: "<Website URL>",
  imageUrl: uploadRes.secure_url,
  imagePublicId: uploadRes.public_id,
  order: 0
}
```

### Step 6: Verify Live on Portfolio
1. Clean up temporary files from `public/` and workspace root (`mockup_renderer.html`, temporary screenshots).
2. Navigate to `http://localhost:3000/#projects`.
3. Verify that the project card in the **Featured Projects** widescreen showcase renders the multi-device mockup cleanly with the correct title and tags.
