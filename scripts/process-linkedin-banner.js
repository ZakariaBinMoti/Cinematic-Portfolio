const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Manually parse .env.local
try {
  const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
} catch {}

const sourceImagePath = 'C:\\Users\\SMT\\.gemini\\antigravity-ide\\brain\\c08b0727-0cae-440e-bf3f-3d244874e464\\linkedin_banner_bg_1792406889556.jpg';
const outputDir = path.join(__dirname, '../public');

async function processBanner() {
  console.log('Processing LinkedIn Banner (1584 x 396)...');

  // 1. Clean background banner at exact 1584 x 396
  // Focus slightly towards the right and center to capture the full circuit artwork and the ambient glow
  const baseBanner = sharp(sourceImagePath)
    .resize(1584, 396, {
      fit: 'cover',
      position: 'right top',
    });

  const cleanBannerBuffer = await baseBanner.toBuffer();
  const cleanOutputPath = path.join(outputDir, 'linkedin-banner-minimal.png');
  fs.writeFileSync(cleanOutputPath, cleanBannerBuffer);
  console.log('Saved minimal banner to:', cleanOutputPath);

  // 2. High-precision SVG text overlay for professional branding
  // Profile picture on LinkedIn sits at ~x: 45 to 210, y: 190 to 396 (desktop)
  // Text will be placed starting at x=280, with perfect visual hierarchy
  const svgOverlay = `
  <svg width="1584" height="396" viewBox="0 0 1584 396" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="50%" stop-color="#3594bd" />
        <stop offset="100%" stop-color="#a855f7" />
      </linearGradient>
      <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#cbd5e1" />
      </linearGradient>
      <linearGradient id="pillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(53, 148, 189, 0.25)" />
        <stop offset="100%" stop-color="rgba(168, 85, 247, 0.15)" />
      </linearGradient>
      <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <style>
      .eyebrow {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 4px;
        text-transform: uppercase;
        fill: #38bdf8;
      }
      .name {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 44px;
        font-weight: 800;
        letter-spacing: -0.5px;
        fill: url(#textGrad);
      }
      .headline {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 20px;
        font-weight: 600;
        fill: #94a3b8;
      }
      .accent-title {
        fill: url(#cyanGrad);
        font-weight: 700;
      }
      .pill-text {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.5px;
        fill: #e2e8f0;
      }
      .domain {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "JetBrains Mono", monospace;
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 1.5px;
        fill: rgba(255, 255, 255, 0.7);
      }
    </style>

    <!-- Subtle backdrop vignette on text side for maximum contrast -->
    <rect x="0" y="0" width="850" height="396" fill="url(#leftGradient)" opacity="0.35" />

    <!-- Eyebrow Badge -->
    <g transform="translate(260, 85)">
      <rect x="0" y="0" width="220" height="24" rx="12" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1" />
      <circle cx="14" cy="12" r="4" fill="#38bdf8" />
      <text x="26" y="16" class="eyebrow" font-size="10" letter-spacing="2">PORTFOLIO FLAGSHIP</text>
    </g>

    <!-- Main Name -->
    <text x="260" y="152" class="name">ZAKARIA BIN MOTI</text>

    <!-- Role & Specialization -->
    <text x="260" y="188" class="headline">
      <tspan class="accent-title">Lead Software Engineer</tspan>
      <tspan fill="#64748b"> • </tspan>
      <tspan fill="#cbd5e1">Shopify OS 2.0 Architect</tspan>
    </text>

    <!-- Tech Specialty Pills -->
    <g transform="translate(260, 218)">
      <!-- Pill 1 -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="168" height="28" rx="14" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
        <text x="84" y="18" text-anchor="middle" class="pill-text">Shopify OS 2.0 &amp; Liquid</text>
      </g>
      <!-- Pill 2 -->
      <g transform="translate(178, 0)">
        <rect x="0" y="0" width="155" height="28" rx="14" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
        <text x="77" y="18" text-anchor="middle" class="pill-text">Next.js &amp; TypeScript</text>
      </g>
      <!-- Pill 3 -->
      <g transform="translate(343, 0)">
        <rect x="0" y="0" width="138" height="28" rx="14" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
        <text x="69" y="18" text-anchor="middle" class="pill-text">High-Ticket CRO</text>
      </g>
      <!-- Pill 4 -->
      <g transform="translate(491, 0)">
        <rect x="0" y="0" width="158" height="28" rx="14" fill="rgba(56, 189, 248, 0.1)" stroke="rgba(56, 189, 248, 0.3)" stroke-width="1" />
        <text x="79" y="18" text-anchor="middle" class="pill-text" fill="#38bdf8">0.7s LCP Core Web Vitals</text>
      </g>
    </g>

    <!-- Metrics Bar / Footer info -->
    <g transform="translate(260, 275)">
      <line x1="0" y1="0" x2="650" y2="0" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />
      
      <g transform="translate(0, 22)">
        <text x="0" y="0" class="domain">✦ 250+ Production Stores</text>
        <text x="210" y="0" class="domain">✦ Enterprise Scalability</text>
        <text x="420" y="0" class="domain">✦ Headless &amp; Custom Themes</text>
      </g>
    </g>
  </svg>
  `;

  const brandedBannerBuffer = await sharp(cleanBannerBuffer)
    .composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0,
      },
    ])
    .png({ quality: 100 })
    .toBuffer();

  const brandedOutputPath = path.join(outputDir, 'linkedin-banner.png');
  fs.writeFileSync(brandedOutputPath, brandedBannerBuffer);
  console.log('Saved branded banner to:', brandedOutputPath);

  // 3. Upload to Cloudinary if credentials available
  try {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const base64Branded = `data:image/png;base64,${brandedBannerBuffer.toString('base64')}`;
    const resultBranded = await cloudinary.uploader.upload(base64Branded, {
      folder: 'portfolio/linkedin',
      public_id: 'zakaria_bin_moti_linkedin_banner_1584x396',
      overwrite: true,
    });
    console.log('Uploaded branded banner to Cloudinary:', resultBranded.secure_url);

    const base64Minimal = `data:image/png;base64,${cleanBannerBuffer.toString('base64')}`;
    const resultMinimal = await cloudinary.uploader.upload(base64Minimal, {
      folder: 'portfolio/linkedin',
      public_id: 'zakaria_bin_moti_linkedin_banner_minimal_1584x396',
      overwrite: true,
    });
    console.log('Uploaded minimal banner to Cloudinary:', resultMinimal.secure_url);

    return {
      brandedUrl: resultBranded.secure_url,
      minimalUrl: resultMinimal.secure_url,
      localBrandedPath: brandedOutputPath,
      localMinimalPath: cleanOutputPath,
    };
  } catch (err) {
    console.warn('Cloudinary upload skipped or failed:', err.message);
    return {
      localBrandedPath: brandedOutputPath,
      localMinimalPath: cleanOutputPath,
    };
  }
}

processBanner().catch(console.error);
