const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_PHOTO = 'C:\\Users\\SMT\\.gemini\\antigravity-ide\\brain\\c08b0727-0cae-440e-bf3f-3d244874e464\\.user_uploaded\\media_1791261833033.jpg';
const WORKSPACE_DIR = __dirname;

// Perfectly calibrated face-centered crop
// Facial feature center in 1024x1024 source is X = 568, Y = 430
// Size 720 provides complete head framing with natural breathing room
const CROP_CFG = {
  left: 208,
  top: 70,
  size: 720,
};

function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(count, 4); // count

  let offset = 6 + count * 16;
  const dirEntries = [];
  for (const img of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    offset += img.buffer.length;
  }
  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(b => b.buffer)]);
}

async function buildFavicons() {
  console.log('Generating centered favicon suite...');

  // 1. Generate 512x512 base circular icon
  const maskSvg512 = Buffer.from('<svg width="512" height="512"><circle cx="256" cy="256" r="244" fill="#fff" /></svg>');
  const ringSvg512 = Buffer.from(
    `<svg width="512" height="512">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#a78bfa" />
          <stop offset="50%" stop-color="#60a5fa" />
          <stop offset="100%" stop-color="#38bdf8" />
        </linearGradient>
      </defs>
      <circle cx="256" cy="256" r="246" fill="none" stroke="url(#ringGrad)" stroke-width="14" />
    </svg>`
  );

  const cropped512 = await sharp(SOURCE_PHOTO)
    .extract({ left: CROP_CFG.left, top: CROP_CFG.top, width: CROP_CFG.size, height: CROP_CFG.size })
    .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
    .composite([{ input: maskSvg512, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const icon512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: cropped512, top: 0, left: 0 },
    { input: ringSvg512, top: 0, left: 0 }
  ])
  .png()
  .toBuffer();

  fs.writeFileSync(path.join(WORKSPACE_DIR, 'src/app/icon.png'), icon512);
  fs.writeFileSync(path.join(WORKSPACE_DIR, 'public/favicon.png'), icon512);

  // 2. 32x32 & 16x16 PNG favicons
  const icon32 = await sharp(icon512).resize(32, 32, { kernel: sharp.kernel.lanczos3 }).png().toBuffer();
  fs.writeFileSync(path.join(WORKSPACE_DIR, 'public/favicon-32x32.png'), icon32);

  const icon16 = await sharp(icon512).resize(16, 16, { kernel: sharp.kernel.lanczos3 }).png().toBuffer();
  fs.writeFileSync(path.join(WORKSPACE_DIR, 'public/favicon-16x16.png'), icon16);

  const icon48 = await sharp(icon512).resize(48, 48, { kernel: sharp.kernel.lanczos3 }).png().toBuffer();

  // 3. Multi-resolution favicon.ico
  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: icon16 },
    { width: 32, height: 32, buffer: icon32 },
    { width: 48, height: 48, buffer: icon48 },
  ]);
  fs.writeFileSync(path.join(WORKSPACE_DIR, 'public/favicon.ico'), icoBuffer);

  // 4. Apple touch icon 180x180
  const maskSvg180 = Buffer.from(
    `<svg width="180" height="180">
      <rect x="4" y="4" width="172" height="172" rx="38" ry="38" fill="#fff" />
    </svg>`
  );
  const ringSvg180 = Buffer.from(
    `<svg width="180" height="180">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#a78bfa" />
          <stop offset="50%" stop-color="#60a5fa" />
          <stop offset="100%" stop-color="#38bdf8" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="172" height="172" rx="38" ry="38" fill="none" stroke="url(#ringGrad)" stroke-width="7" />
    </svg>`
  );

  const cropped180 = await sharp(SOURCE_PHOTO)
    .extract({ left: CROP_CFG.left, top: CROP_CFG.top, width: CROP_CFG.size, height: CROP_CFG.size })
    .resize(180, 180, { kernel: sharp.kernel.lanczos3 })
    .composite([{ input: maskSvg180, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const appleIcon180 = await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: cropped180, top: 0, left: 0 },
    { input: ringSvg180, top: 0, left: 0 }
  ])
  .png()
  .toBuffer();

  fs.writeFileSync(path.join(WORKSPACE_DIR, 'src/app/apple-icon.png'), appleIcon180);

  console.log('✔ All favicons successfully generated with centered face alignment!');
}

buildFavicons().catch(console.error);
