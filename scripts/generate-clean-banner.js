const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Parse .env.local
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

const portraitPath = 'C:\\Users\\SMT\\.gemini\\antigravity-ide\\brain\\c08b0727-0cae-440e-bf3f-3d244874e464\\.user_uploaded\\media_1792473230610.jpg';
const outputDir = path.join(__dirname, '../public');

async function createBanner() {
  const width = 1584;
  const height = 396;

  console.log('1. Rendering executive background...');
  // Background: Deep executive dark slate gradient with subtle engineering grid
  const bgSvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Base executive dark slate gradient -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0c0e14" />
        <stop offset="35%" stop-color="#12151d" />
        <stop offset="70%" stop-color="#1e222c" />
        <stop offset="100%" stop-color="#2d313a" />
      </linearGradient>

      <!-- Minimalist engineering grid for high-end tech aesthetic -->
      <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
        <path d="M 44 0 L 0 0 0 44" fill="none" stroke="rgba(255, 255, 255, 0.022)" stroke-width="1" />
        <circle cx="44" cy="44" r="0.8" fill="rgba(255, 255, 255, 0.038)" />
      </pattern>

      <!-- Soft focused ambient light behind typography ONLY (x: 400-800) -->
      <radialGradient id="centerAmbient" cx="42%" cy="40%" r="45%">
        <stop offset="0%" stop-color="rgba(96, 165, 250, 0.05)" />
        <stop offset="100%" stop-color="rgba(0, 0, 0, 0)" />
      </radialGradient>
    </defs>

    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    <rect width="${width}" height="${height}" fill="url(#grid)" />
    <rect width="${width}" height="${height}" fill="url(#centerAmbient)" />

    <!-- Subtle luxury top and bottom hairline borders -->
    <line x1="0" y1="0" x2="${width}" y2="0" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />
    <line x1="0" y1="${height}" x2="${width}" y2="${height}" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" />
  </svg>
  `;

  const bgBuffer = await sharp(Buffer.from(bgSvg)).png().toBuffer();

  console.log('2. Processing and true alpha-feathering portrait image...');
  const portraitWidth = 460;
  const portraitHeight = 396;
  const fadeWidth = 260; // 260px wide silky-smooth mathematical cosine ease

  const { data: rgbData } = await sharp(portraitPath)
    .resize(portraitWidth, portraitHeight, { fit: 'cover', position: 'top' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgbaBuffer = Buffer.alloc(portraitWidth * portraitHeight * 4);
  for (let y = 0; y < portraitHeight; y++) {
    for (let x = 0; x < portraitWidth; x++) {
      const srcIdx = (y * portraitWidth + x) * 3;
      const dstIdx = (y * portraitWidth + x) * 4;

      rgbaBuffer[dstIdx] = rgbData[srcIdx];
      rgbaBuffer[dstIdx + 1] = rgbData[srcIdx + 1];
      rgbaBuffer[dstIdx + 2] = rgbData[srcIdx + 2];

      let alpha = 255;
      if (x < fadeWidth) {
        const t = x / fadeWidth;
        alpha = Math.round(((1 - Math.cos(t * Math.PI)) / 2) * 255);
      }
      rgbaBuffer[dstIdx + 3] = alpha;
    }
  }

  const featheredPortrait = await sharp(rgbaBuffer, {
    raw: { width: portraitWidth, height: portraitHeight, channels: 4 }
  }).png().toBuffer();

  const portraitLeft = width - portraitWidth;
  const bgWithPortrait = await sharp(bgBuffer)
    .composite([
      {
        input: featheredPortrait,
        left: portraitLeft,
        top: 0,
      },
    ])
    .png()
    .toBuffer();

  console.log('3. Rendering razor-sharp vector typography & authentic info...');
  // Layout Zones:
  // Safe Zone: x = 0 to 380 is 100% free of text (reserved for LinkedIn profile circle avatar)
  // Content Zone: x = 390 to 1080 (width ~690px)
  // Portrait Zone: x = 1124 to 1584
  const textSvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="titleGlow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#f8fafc" />
      </linearGradient>

      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#60a5fa" />
        <stop offset="100%" stop-color="#93c5fd" />
      </linearGradient>

      <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="rgba(96, 165, 250, 0.12)" />
        <stop offset="100%" stop-color="rgba(96, 165, 250, 0.04)" />
      </linearGradient>
    </defs>

    <style>
      .badge-text {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 2px;
        text-transform: uppercase;
        fill: #60a5fa;
      }
      .name {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
        font-size: 43px;
        font-weight: 800;
        letter-spacing: 0.5px;
        fill: url(#titleGlow);
      }
      .headline {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
        font-size: 19px;
        font-weight: 500;
        fill: #cbd5e1;
      }
      .headline-strong {
        font-weight: 700;
        fill: url(#accentGrad);
      }
      .pill-text {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.2px;
        fill: #e2e8f0;
      }
      .contact-text {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "JetBrains Mono", monospace;
        font-size: 13.5px;
        font-weight: 600;
        letter-spacing: 0.4px;
        fill: #f8fafc;
      }
      .metric-label {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.3px;
        fill: #cbd5e1;
      }
    </style>

    <!-- 1. Kicker Eyebrow Badge (Safe X = 390, Y = 46) -->
    <g transform="translate(390, 46)">
      <rect x="0" y="0" width="310" height="24" rx="12" fill="url(#badgeGrad)" stroke="rgba(96, 165, 250, 0.3)" stroke-width="1" />
      <circle cx="14" cy="12" r="4" fill="#60a5fa" />
      <text x="26" y="16" class="badge-text">LEAD SOFTWARE ENGINEER</text>
    </g>

    <!-- 2. Authoritative Full Name (Y = 114) -->
    <text x="390" y="114" class="name">ZAKARIA BIN MOTI</text>

    <!-- 3. Primary Role & Value Proposition (Y = 150) -->
    <text x="390" y="150" class="headline">
      <tspan class="headline-strong">Shopify OS 2.0 Architect</tspan>
      <tspan fill="#64748b"> • </tspan>
      <tspan fill="#e2e8f0">Full-Stack eCommerce Specialist</tspan>
    </text>

    <!-- 4. Specialty Capability Pills (Y = 182) -->
    <g transform="translate(390, 182)">
      <!-- Pill 1: Custom Themes -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="168" height="28" rx="14" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
        <text x="84" y="18" text-anchor="middle" class="pill-text">Custom OS 2.0 Themes</text>
      </g>
      <!-- Pill 2: Headless -->
      <g transform="translate(178, 0)">
        <rect x="0" y="0" width="158" height="28" rx="14" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
        <text x="79" y="18" text-anchor="middle" class="pill-text">Next.js &amp; Headless</text>
      </g>
      <!-- Pill 3: CRO -->
      <g transform="translate(346, 0)">
        <rect x="0" y="0" width="134" height="28" rx="14" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
        <text x="67" y="18" text-anchor="middle" class="pill-text">High-Ticket CRO</text>
      </g>
      <!-- Pill 4: Web Vitals -->
      <g transform="translate(490, 0)">
        <rect x="0" y="0" width="176" height="28" rx="14" fill="rgba(96, 165, 250, 0.09)" stroke="rgba(96, 165, 250, 0.28)" stroke-width="1" />
        <text x="88" y="18" text-anchor="middle" class="pill-text" fill="#93c5fd">⚡ Sub-0.7s Core Web Vitals</text>
      </g>
    </g>

    <!-- 5. Architectural Hairline Divider (Y = 242) -->
    <line x1="390" y1="242" x2="1050" y2="242" stroke="rgba(255, 255, 255, 0.09)" stroke-width="1" />

    <!-- 6. Authentic Contact & Live Credentials Row (Y = 268) -->
    <g transform="translate(390, 268)">
      <!-- Website Link with Vector Globe Icon -->
      <g transform="translate(0, 0)">
        <g transform="translate(0, 2)">
          <circle cx="8" cy="8" r="7.5" fill="none" stroke="#60a5fa" stroke-width="1.3" />
          <ellipse cx="8" cy="8" rx="3.2" ry="7.5" fill="none" stroke="#60a5fa" stroke-width="1.1" />
          <line x1="0.5" y1="8" x2="15.5" y2="8" stroke="#60a5fa" stroke-width="1.1" />
        </g>
        <text x="24" y="15" class="contact-text">hellozakaria.com</text>
      </g>

      <!-- Email Link with Vector Mail Icon -->
      <g transform="translate(195, 0)">
        <g transform="translate(0, 3)">
          <rect x="0" y="0" width="17" height="12" rx="2" fill="none" stroke="#60a5fa" stroke-width="1.3" />
          <path d="M 0 1 L 8.5 7.5 L 17 1" fill="none" stroke="#60a5fa" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
        </g>
        <text x="26" y="15" class="contact-text">zakaria.binmoti@gmail.com</text>
      </g>

      <!-- Proven Track Record -->
      <g transform="translate(460, 0)">
        <text x="0" y="15" class="metric-label">
          <tspan fill="#f59e0b">✦ </tspan>
          <tspan fill="#ffffff" font-weight="700">250+ Stores </tspan>
          <tspan fill="#94a3b8">Delivered</tspan>
        </text>
      </g>
    </g>
  </svg>
  `;

  console.log('4. Compositing final banner...');
  const finalBannerBuffer = await sharp(bgWithPortrait)
    .composite([
      {
        input: Buffer.from(textSvg),
        left: 0,
        top: 0,
      },
    ])
    .png({ quality: 100 })
    .toBuffer();

  const localFile = path.join(outputDir, 'linkedin-banner.png');
  fs.writeFileSync(localFile, finalBannerBuffer);
  console.log('Saved final banner to:', localFile);

  // Upload to Cloudinary
  try {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const base64Data = `data:image/png;base64,${finalBannerBuffer.toString('base64')}`;
    const uploadRes = await cloudinary.uploader.upload(base64Data, {
      folder: 'portfolio/linkedin',
      public_id: 'zakaria_bin_moti_linkedin_banner_clean',
      overwrite: true,
    });

    console.log('Cloudinary Upload Success:', uploadRes.secure_url);
    return {
      success: true,
      localPath: localFile,
      cloudinaryUrl: uploadRes.secure_url,
    };
  } catch (err) {
    console.warn('Cloudinary upload warning:', err.message);
    return {
      success: true,
      localPath: localFile,
      cloudinaryUrl: null,
    };
  }
}

createBanner()
  .then(res => console.log('Complete:', res))
  .catch(console.error);
