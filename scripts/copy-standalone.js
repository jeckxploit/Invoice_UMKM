const fs = require('fs');
const path = require('path');

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);

  for (const file of files) {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      copyFolderRecursiveSync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

const baseDir = path.join(__dirname, '..');
const nextStaticDir = path.join(baseDir, '.next', 'static');
const standaloneStaticDir = path.join(baseDir, '.next', 'standalone', '.next', 'static');
const publicDir = path.join(baseDir, 'public');
const standalonePublicDir = path.join(baseDir, '.next', 'standalone', 'public');

console.log('Copying static assets...');

// Copy .next/static to .next/standalone/.next/static
if (fs.existsSync(nextStaticDir)) {
  copyFolderRecursiveSync(nextStaticDir, standaloneStaticDir);
  console.log('✓ Copied static files');
} else {
  console.log('⚠ Static directory not found');
}

// Copy public to .next/standalone/public
if (fs.existsSync(publicDir)) {
  copyFolderRecursiveSync(publicDir, standalonePublicDir);
  console.log('✓ Copied public files');
} else {
  console.log('⚠ Public directory not found');
}

console.log('\n✅ Build standalone completed!');
