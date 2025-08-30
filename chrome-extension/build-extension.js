import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to copy files recursively
function copyRecursive(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    files.forEach(file => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      copyRecursive(srcPath, destPath);
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Function to copy extension files after build
function copyExtensionFiles() {
  const publicDir = path.join(__dirname, 'public');
  const distDir = path.join(__dirname, 'dist');
  
  // Copy all files from public to dist
  if (fs.existsSync(publicDir)) {
    copyRecursive(publicDir, distDir);
  }
  
  // Copy manifest.json to dist
  const manifestPath = path.join(__dirname, 'public', 'manifest.json');
  const manifestDest = path.join(__dirname, 'dist', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    fs.copyFileSync(manifestPath, manifestDest);
  }
  
  console.log('Extension files copied successfully!');
}

// Run the copy function
copyExtensionFiles(); 