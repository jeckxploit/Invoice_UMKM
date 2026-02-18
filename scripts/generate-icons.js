const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createIcon(size, outputPath) {
  // Create SVG content for the icon
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ea580c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#c2410c;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background with rounded corners -->
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad${size})"/>
      
      <!-- Document Icon -->
      <rect x="${size * 0.3}" y="${size * 0.2}" width="${size * 0.4}" height="${size * 0.55}" rx="${size * 0.05}" fill="white" opacity="0.95"/>
      
      <!-- Lines on document -->
      <rect x="${size * 0.38}" y="${size * 0.28}" width="${size * 0.24}" height="${size * 0.04}" rx="${size * 0.02}" fill="#ea580c"/>
      <rect x="${size * 0.38}" y="${size * 0.35}" width="${size * 0.18}" height="${size * 0.03}" rx="${size * 0.015}" fill="#fed7aa"/>
      <rect x="${size * 0.38}" y="${size * 0.41}" width="${size * 0.22}" height="${size * 0.03}" rx="${size * 0.015}" fill="#fed7aa"/>
      <rect x="${size * 0.38}" y="${size * 0.47}" width="${size * 0.14}" height="${size * 0.03}" rx="${size * 0.015}" fill="#fed7aa"/>
      
      <!-- Check circle -->
      <circle cx="${size * 0.65}" cy="${size * 0.62}" r="${size * 0.1}" fill="#ea580c"/>
      <path d="M ${size * 0.6} ${size * 0.62} L ${size * 0.63} ${size * 0.65} L ${size * 0.7} ${size * 0.58}" stroke="white" stroke-width="${size * 0.015}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      
      <!-- IU Text -->
      <text x="${size * 0.5}" y="${size * 0.85}" font-family="Arial, sans-serif" font-size="${size * 0.12}" font-weight="bold" fill="white" text-anchor="middle">IU</text>
    </svg>
  `;

  // Convert SVG to PNG
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outputPath);

  console.log(`Created ${outputPath}`);
}

async function main() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  
  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Create icons
  await createIcon(192, path.join(iconsDir, 'icon-192x192.png'));
  await createIcon(512, path.join(iconsDir, 'icon-512x512.png'));

  console.log('\n✅ Icons created successfully!');
}

main().catch(console.error);
