/**
 * process_showcase.js
 * Automates the multi-device studio showcase pipeline:
 * 1. Prepares clean cropped screenshots with Sharp
 * 2. Compiles resources/mockup_template.html with project metadata & screenshots
 * 3. Supports direct Cloudinary upload and MongoDB project record creation/update
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

// Load .env.local from project root
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

async function prepareScreenshots({ desktopSrc, tabletSrc, mobileSrc, outDir }) {
  fs.mkdirSync(outDir, { recursive: true });

  const desktopOut = path.join(outDir, 'desktop_clean.png');
  const tabletOut = path.join(outDir, 'tablet_clean.png');
  const mobileOut = path.join(outDir, 'mobile_clean.png');

  // Desktop: 16:9 crop (1904x1080)
  const dMeta = await sharp(desktopSrc).metadata();
  await sharp(desktopSrc)
    .extract({
      left: 0,
      top: 0,
      width: dMeta.width,
      height: Math.min(dMeta.height, 1080),
    })
    .toFile(desktopOut);

  // Tablet: crop bottom chat widget
  const tMeta = await sharp(tabletSrc).metadata();
  await sharp(tabletSrc)
    .extract({
      left: 0,
      top: 0,
      width: tMeta.width,
      height: Math.min(tMeta.height - 75, 870),
    })
    .toFile(tabletOut);

  // Mobile: crop bottom chat widget (height ~628)
  const mMeta = await sharp(mobileSrc).metadata();
  await sharp(mobileSrc)
    .extract({
      left: 0,
      top: 0,
      width: mMeta.width,
      height: Math.min(mMeta.height - 80, 628),
    })
    .toFile(mobileOut);

  return { desktopOut, tabletOut, mobileOut };
}

function compileTemplate(templatePath, data, outputPath) {
  let html = fs.readFileSync(templatePath, 'utf-8');
  for (const [key, val] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, val);
  }
  fs.writeFileSync(outputPath, html, 'utf-8');
  return outputPath;
}

async function uploadAndSaveProject({ imagePath, title, description, techStack, liveLink }) {
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
  console.log('Uploaded:', uploadRes.secure_url);

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
    await project.save();
    console.log('Existing project record updated successfully!');
  } else {
    project = await Project.create({
      title,
      description,
      techStack,
      liveLink,
      imageUrl: uploadRes.secure_url,
      imagePublicId: uploadRes.public_id,
      order: 0,
    });
    console.log('New project record created successfully!');
  }

  await mongoose.disconnect();
  return project;
}

module.exports = {
  prepareScreenshots,
  compileTemplate,
  uploadAndSaveProject,
};
