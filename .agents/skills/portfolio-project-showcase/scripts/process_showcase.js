/**
 * process_showcase.js
 * Multi-Model Showcase Automation Engine:
 * 
 * Supported Models:
 * - Model 1 / "image 1": Studio Trio (Floating Laptop, iPad Pro, iPhone 15 Pro)
 * - Model 2 / "image 2": Apple Desk Setup (Studio Display, iPad & iPhone on Desk Surface)
 * - Model 3 / "image 3": Editorial Collage (Overlapping Multi-Page Mosaic with Feature Chips)
 * - Model 4 / "image 4": Ultrawide Cinema (1340px Flagship Browser & Feature Zoom)
 * - Model 5 / "image 5": 3D Spatial Isometric (Multi-layered Elevated Isometric Slabs)
 * 
 * Strict Standard:
 * - Canvas Resolution: Exact 1920x1200 (16:10 aspect ratio matching ProjectsSection.tsx)
 * - Zero cropping, zero distortion.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}

function resolveModelTemplate(modelInput) {
  const inputStr = String(modelInput || '1').toLowerCase().trim();
  const resourcesDir = path.resolve(__dirname, '../resources');

  if (inputStr === '1' || inputStr.includes('studio') || inputStr === 'image 1' || inputStr === 'model 1') {
    return { name: 'Model 1 (Studio Trio)', file: path.join(resourcesDir, 'model_1_studio_trio.html') };
  } else if (inputStr === '2' || inputStr.includes('desk') || inputStr === 'image 2' || inputStr === 'model 2') {
    return { name: 'Model 2 (Apple Desk Setup)', file: path.join(resourcesDir, 'model_2_desk_setup.html') };
  } else if (inputStr === '3' || inputStr.includes('collage') || inputStr === 'image 3' || inputStr === 'model 3') {
    return { name: 'Model 3 (Editorial Collage)', file: path.join(resourcesDir, 'model_3_editorial_collage.html') };
  } else if (inputStr === '4' || inputStr.includes('cinema') || inputStr === 'image 4' || inputStr === 'model 4') {
    return { name: 'Model 4 (Ultrawide Cinema)', file: path.join(resourcesDir, 'model_4_ultrawide_cinema.html') };
  } else if (inputStr === '5' || inputStr.includes('isometric') || inputStr === 'image 5' || inputStr === 'model 5') {
    return { name: 'Model 5 (3D Spatial Isometric)', file: path.join(resourcesDir, 'model_5_isometric_stack.html') };
  }

  return { name: 'Model 1 (Studio Trio)', file: path.join(resourcesDir, 'mockup_template.html') };
}

async function prepareScreenshots({ desktopSrc, tabletSrc, mobileSrc, outDir }) {
  fs.mkdirSync(outDir, { recursive: true });

  const desktopOut = path.join(outDir, 'desktop_clean.png');
  const tabletOut = path.join(outDir, 'tablet_clean.png');
  const mobileOut = path.join(outDir, 'mobile_clean.png');

  // Desktop: Clean crop
  const dMeta = await sharp(desktopSrc).metadata();
  await sharp(desktopSrc)
    .extract({
      left: 0,
      top: 0,
      width: dMeta.width,
      height: Math.min(dMeta.height, 1080),
    })
    .resize(1920, 1080, { fit: 'cover', position: 'top' })
    .toFile(desktopOut);

  // Tablet: Clean crop
  const tMeta = await sharp(tabletSrc).metadata();
  await sharp(tabletSrc)
    .extract({
      left: 0,
      top: 0,
      width: tMeta.width,
      height: Math.min(tMeta.height - 60, 880),
    })
    .toFile(tabletOut);

  // Mobile: Clean crop
  const mMeta = await sharp(mobileSrc).metadata();
  await sharp(mobileSrc)
    .extract({
      left: 0,
      top: 0,
      width: mMeta.width,
      height: Math.min(mMeta.height - 60, 640),
    })
    .toFile(mobileOut);

  return { desktopOut, tabletOut, mobileOut };
}

function renderHtml(templateFile, metaData, outputPath) {
  let html = fs.readFileSync(templateFile, 'utf-8');
  for (const [key, val] of Object.entries(metaData)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, val);
  }
  fs.writeFileSync(outputPath, html, 'utf-8');
  return outputPath;
}

function captureHeadless1920x1200(htmlUrl, outputPath) {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cmd = `"${chromePath}" --headless=new --disable-gpu --window-size=1920,1200 --virtual-time-budget=3500 --screenshot="${outputPath}" "${htmlUrl}"`;
  execSync(cmd);
  return outputPath;
}

async function uploadAndSaveProject({ imagePath, title, description, techStack, liveLink, order }) {
  loadEnv();

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log('Uploading showcase to Cloudinary...');
  const uploadRes = await cloudinary.uploader.upload(imagePath, {
    folder: 'portfolio',
    public_id: `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_showcase_${Date.now()}`,
    overwrite: true,
  });
  console.log('Uploaded Cloudinary URL:', uploadRes.secure_url);

  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);

  const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    techStack: { type: [String], default: [] },
    liveLink: { type: String },
    imageUrl: { type: String },
    imagePublicId: { type: String },
    order: { type: Number, default: 0 },
  }, { timestamps: true });

  const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

  let project = await Project.findOne({
    $or: [
      { liveLink: { $regex: new RegExp(liveLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } },
      { title: { $regex: new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } }
    ]
  });

  if (project) {
    project.title = title;
    project.description = description;
    project.techStack = techStack;
    project.liveLink = liveLink;
    project.imageUrl = uploadRes.secure_url;
    project.imagePublicId = uploadRes.public_id;
    if (order !== undefined) project.order = order;
    await project.save();
    console.log('Existing project record updated successfully!');
  } else {
    let nextOrder = order;
    if (nextOrder === undefined) {
      const last = await Project.findOne().sort({ order: -1 });
      nextOrder = last ? last.order + 1 : 0;
    }
    project = await Project.create({
      title,
      description,
      techStack,
      liveLink,
      imageUrl: uploadRes.secure_url,
      imagePublicId: uploadRes.public_id,
      order: nextOrder,
    });
    console.log('New project record created successfully with order:', nextOrder);
  }

  await mongoose.disconnect();
  return project;
}

module.exports = {
  resolveModelTemplate,
  prepareScreenshots,
  renderHtml,
  captureHeadless1920x1200,
  uploadAndSaveProject,
};
