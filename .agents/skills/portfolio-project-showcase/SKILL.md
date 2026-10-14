---
name: portfolio-project-showcase
description: >-
  Use this skill whenever the user provides a website URL to add as a portfolio project,
  or asks to add, showcase, or generate a showcase image for a website (especially Shopify or
  eCommerce storefronts). Supports 5 distinct creative showcase models (Model 1: Studio Trio,
  Model 2: Desk Setup, Model 3: Editorial Collage, Model 4: Ultrawide Cinema, Model 5: 3D Isometric).
  Captures real multi-device screenshots (Desktop, Tablet, Mobile), renders at exact 16:10 ratio
  (1920x1200), uploads to Cloudinary, and syncs to MongoDB.
---

# Portfolio Project Showcase Workflow & Design Models

This skill standardizes the end-to-end pipeline for converting client websites into top-tier featured portfolio projects in Zakaria's Portfolio.

Whenever the user specifies a website with an image model:
```text
1. example1.com - image 1
2. example2.com - image 1
3. example3.com - image 3
4. example4.com - image 2
```
or asks to add any project, follow the corresponding model and execution runbook below.

---

## The 5 Showcase Image Models

All models are engineered to the **exact 16:10 container aspect ratio (`1920x1200`)** matching `ProjectsSection.tsx` (`aspect-[16/10]`), ensuring zero cropping on left, right, top, or bottom.

| Model / Command | Official Name | Visual Design Concept | Best Suited For | Template File |
| :--- | :--- | :--- | :--- | :--- |
| **`image 1`**<br>(`model 1`) | **Studio Trio**<br>*(Default)* | Three floating hardware devices: MacBook Pro (Center-Left), iPad Pro (Center-Right), iPhone 15 Pro (Foreground Right) with subtle studio floor glow, dynamic pill badges, and bottom stat counters. | High-tier flagships, full-store builds, continuous retainers | `resources/model_1_studio_trio.html` |
| **`image 2`**<br>(`model 2`) | **Apple Desk Setup** | Realistic minimalist workspace: Apple Studio Display on aluminum stand, iPad Pro resting on desk surface, iPhone 15 Pro on aluminum desk puck, dark matte obsidian desk with subtle screen reflection. | Luxury brands, bespoke hardware & physical lifestyle stores | `resources/model_2_desk_setup.html` |
| **`image 3`**<br>(`model 3`) | **Editorial Collage** | Modern multi-page mosaic: overlapping macOS browser windows (Desktop hero + PDP detail view) and floating mobile card with floating interactive callout chips pointing to custom code features. | Complex technical apps, multi-page architectures, custom PDPs | `resources/model_3_editorial_collage.html` |
| **`image 4`**<br>(`model 4`) | **Ultrawide Cinema** | Expansive 1340px flagship browser frame taking center stage, accompanied by a floating feature inspection card (zooming into a custom configurator/sizing tool) and iPhone 15 Pro. | Stores with rich panoramic photography, lookbooks, or visual brand impact | `resources/model_4_ultrawide_cinema.html` |
| **`image 5`**<br>(`model 5`) | **3D Spatial Isometric** | Futuristic 3D angled isometric plane stack: Desktop base layer, elevated Tablet mid-layer (+80px Z), and floating Mobile top-layer (+160px Z) with cybernetic ambient glows. | High-tech products, collectibles/TCG, crypto/web3, innovative logic | `resources/model_5_isometric_stack.html` |

---

## Strict Rules & Principles

1. **Brand Name Accuracy**:
   - Verify the exact brand capitalization and spacing (e.g., "Suitshark", NOT "Suit Shark").
   - Maintain the single-word / official brand formatting across title, description, tags, and badges.

2. **Zero Fake / AI Images**:
   - **NEVER** use AI image generators (`generate_image`) to fabricate fake websites or hallucinated mockups.
   - **ALWAYS** capture 100% genuine screenshots of the live website across Desktop, Tablet, and Mobile viewports using `browser_subagent`.

3. **Mandatory 16:10 Ratio (`1920x1200`)**:
   - The website project card container in `src/components/ProjectsSection.tsx` has `aspect-[16/10]`.
   - **ALWAYS** generate the final showcase at **`1920x1200`** using headless Chrome capture to prevent OS window clamping and avoid any cropping.

4. **Widget & Chat Icon Sanitation**:
   - Always crop or patch out floating third-party widgets (e.g., UserWay accessibility icons, Shopify Inbox / Tidio / Zendesk chat bubbles, Klaviyo popups) before embedding screenshots into mockup frames.

---

## Step-by-Step Execution Runbook

### Step 1: Discover & Capture Live Storefront (Multi-Device)
Use `browser_subagent` to navigate to the target URL:
1. **Desktop View (`1920x1080`)**:
   - Dismiss any newsletter popup, cookie banner, or region modal.
   - Smoothly scroll down so all lazy-loaded imagery renders.
   - Scroll back to top.
   - Capture desktop landing page (Header, navigation, search, and hero photography).
2. **Tablet View (`804x1005` or tablet viewport)**:
   - Navigate to the most complex, bespoke, or unique feature of the site (e.g. custom product bundle configurator, advanced filter collection, sizing calculator).
   - Capture the feature in portrait or landscape tablet view.
3. **Mobile View (`390x844` or `500x749`)**:
   - Switch to mobile viewport.
   - Capture responsive mobile view (hamburger menu, brand logo, search bar, and hero photography).

### Step 2: Clean Crop with Sharp
Use Node.js with `sharp` to extract clean, widget-free crops:
- **Desktop**: Extract hero section (y: 0 to ~675 or ~860) and resize to `1920x1080` cover.
- **Tablet**: Crop out bottom chat widget (height ~860-880px).
- **Mobile**: Crop cleanly right after the hero image (height ~625-640px).

### Step 3: Compile Selected Model Template
Select the template based on user command (`image 1`, `image 2`, `image 3`, `image 4`, `image 5`):
- `model_1_studio_trio.html`
- `model_2_desk_setup.html`
- `model_3_editorial_collage.html`
- `model_4_ultrawide_cinema.html`
- `model_5_isometric_stack.html`

Replace placeholders:
- `{{BRAND_NAME}}`: e.g. "POKEPIXELS"
- `{{SITE_URL}}`: e.g. "https://shop.pokepixels.com/"
- `{{TAG_ACCENT}}`, `{{TAG_2}}`, `{{TAG_3}}`: e.g. "⚡ Authenticated PSA Vault & TCG Engine", "Real-Time Waitlist System", "US & Canadian Shipping"
- `{{DESKTOP_IMG_URL}}`, `{{TABLET_IMG_URL}}`, `{{MOBILE_IMG_URL}}`
- `{{TABLET_BADGE}}`, `{{MOBILE_BADGE}}`
- `{{STAT_1_VAL}}`, `{{STAT_1_LABEL}}`, `{{STAT_2_VAL}}`, `{{STAT_2_LABEL}}`, `{{STAT_3_VAL}}`, `{{STAT_3_LABEL}}`

Save compiled HTML to `public/<project>_renderer.html`.

### Step 4: Capture Headless 1920x1200 Screenshot
Execute headless Chrome CLI to capture exact 1920x1200 screenshot:
```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --window-size=1920,1200 --virtual-time-budget=3500 --screenshot="<outPath>" "http://localhost:3000/<project>_renderer.html"
```
Verify with `sharp` that dimensions are `1920 x 1200` (Ratio `1.6000`).

### Step 5: Upload to Cloudinary & Update MongoDB
1. Upload to Cloudinary (`folder: 'portfolio'`).
2. Connect to MongoDB Atlas using `dns.setServers(['8.8.8.8', '1.1.1.1'])`.
3. Upsert into `projects` collection with title, description, techStack, liveLink, imageUrl, imagePublicId, and order.

### Step 6: Verify Live on Portfolio
1. Clean up temporary files from `public/` and workspace root (`<project>_renderer.html`, temporary image folders).
2. Navigate to `http://localhost:3000/?refresh=true#projects`.
3. Verify that the project card renders edge-to-edge with zero cropping and crisp hardware frames.
