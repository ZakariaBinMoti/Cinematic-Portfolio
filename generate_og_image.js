const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateOgImage() {
  const width = 1200;
  const height = 630;

  console.log('Generating cinematic OpenGraph image (1200x630)...');

  // Background SVG with glows, borders, and typography
  const svgOverlay = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="azureGlow" cx="15%" cy="30%" r="50%">
          <stop offset="0%" stop-color="#3594bd" stop-opacity="0.30"/>
          <stop offset="100%" stop-color="#080a10" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="terracottaGlow" cx="85%" cy="70%" r="55%">
          <stop offset="0%" stop-color="#f6602d" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#080a10" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="rimLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="transparent"/>
          <stop offset="30%" stop-color="#3594bd" stop-opacity="0.8"/>
          <stop offset="70%" stop-color="#f6602d" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="transparent"/>
        </linearGradient>
        <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
      </defs>

      <!-- Deep cinematic dark background -->
      <rect width="${width}" height="${height}" fill="#080a10"/>

      <!-- Ambient atmosphere glows -->
      <rect width="${width}" height="${height}" fill="url(#azureGlow)"/>
      <rect width="${width}" height="${height}" fill="url(#terracottaGlow)"/>

      <!-- Inner glass border card -->
      <rect x="36" y="36" width="${width - 72}" height="${height - 72}" rx="28" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1.5"/>

      <!-- Top glowing edge -->
      <line x1="120" y1="36" x2="${width - 120}" y2="36" stroke="url(#rimLine)" stroke-width="2.5"/>

      <!-- Top Brand Tag -->
      <g transform="translate(80, 95)">
        <rect width="190" height="34" rx="17" fill="rgba(53, 148, 189, 0.15)" stroke="rgba(53, 148, 189, 0.4)" stroke-width="1"/>
        <circle cx="18" cy="17" r="4.5" fill="#3594bd"/>
        <text x="32" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="600" fill="#93c5fd" letter-spacing="0.5">PORTFOLIO &amp; LAB</text>
      </g>

      <!-- Main Title -->
      <text x="80" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="64" font-weight="800" fill="url(#textGrad)" letter-spacing="-1.5">
        Zakaria Bin Moti
      </text>

      <!-- Subtitle -->
      <text x="80" y="265" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="28" font-weight="500" fill="#3594bd" letter-spacing="-0.2">
        Lead Software Engineer &amp; Shopify Architect
      </text>

      <!-- Description / Supporting Line -->
      <text x="80" y="315" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="400" fill="#94a3b8" letter-spacing="0">
        Crafting high-converting eCommerce stores &amp; custom Next.js web applications.
      </text>

      <!-- Metric Pills Row -->
      <g transform="translate(80, 375)">
        <!-- Pill 1 -->
        <rect x="0" y="0" width="220" height="52" rx="14" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1"/>
        <text x="20" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="18" font-weight="700" fill="#ffffff">250+</text>
        <text x="75" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="15" font-weight="400" fill="#94a3b8">Stores Built</text>

        <!-- Pill 2 -->
        <g transform="translate(236, 0)">
          <rect x="0" y="0" width="225" height="52" rx="14" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1"/>
          <text x="20" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="18" font-weight="700" fill="#ffffff">Shopify</text>
          <text x="90" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="15" font-weight="400" fill="#94a3b8">Liquid / OS 2.0</text>
        </g>

        <!-- Pill 3 -->
        <g transform="translate(477, 0)">
          <rect x="0" y="0" width="245" height="52" rx="14" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1"/>
          <text x="20" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="18" font-weight="700" fill="#ffffff">Next.js</text>
          <text x="90" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="15" font-weight="400" fill="#94a3b8">React &amp; Full-Stack</text>
        </g>
      </g>

      <!-- Bottom Footer Bar -->
      <g transform="translate(80, 520)">
        <text x="0" y="0" font-family="'Courier New', Courier, monospace" font-size="18" font-weight="600" fill="#f6602d" letter-spacing="1">
          hellozakaria.com
        </text>
        <text x="260" y="-1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="15" font-weight="400" fill="#64748b">
          // High-End Scrollytelling Experience &amp; Architecture
        </text>
      </g>
    </svg>
  `;

  // Check if avatar/photo exists to composite on right side
  const iconPath = path.join(__dirname, 'public', 'favicon.png');
  const compositeList = [{ input: Buffer.from(svgOverlay), top: 0, left: 0 }];

  if (fs.existsSync(iconPath)) {
    const avatarSize = 250;
    const avatarCircle = Buffer.from(
      `<svg width="${avatarSize}" height="${avatarSize}">
        <circle cx="${avatarSize/2}" cy="${avatarSize/2}" r="${avatarSize/2 - 4}" fill="#fff" />
      </svg>`
    );
    const avatarRing = Buffer.from(
      `<svg width="${avatarSize}" height="${avatarSize}">
        <circle cx="${avatarSize/2}" cy="${avatarSize/2}" r="${avatarSize/2 - 2}" fill="none" stroke="#3594bd" stroke-width="4" opacity="0.8"/>
      </svg>`
    );

    const croppedAvatar = await sharp(iconPath)
      .resize(avatarSize, avatarSize, { fit: 'cover' })
      .composite([
        { input: avatarCircle, blend: 'dest-in' },
        { input: avatarRing, blend: 'over' },
      ])
      .png()
      .toBuffer();

    compositeList.push({
      input: croppedAvatar,
      top: 155,
      left: 855,
    });
  }

  const outputPath = path.join(__dirname, 'public', 'og-image.png');
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 8, g: 10, b: 16, alpha: 1 },
    },
  })
    .composite(compositeList)
    .png({ quality: 95 })
    .toFile(outputPath);

  console.log('Successfully generated public/og-image.png:', outputPath);
}

generateOgImage().catch((err) => {
  console.error('Error generating OG image:', err);
  process.exit(1);
});
