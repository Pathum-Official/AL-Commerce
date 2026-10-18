import fs from 'fs';
import path from 'path';

console.log('🚀 Copying static learning resources into dist/...');
const dirs = ['syllabuses', 'past-papers', 'notes'];

const distDir = path.resolve(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

for (const dir of dirs) {
  const src = path.resolve(process.cwd(), dir);
  if (fs.existsSync(src)) {
    const dest = path.resolve(distDir, dir);
    console.log(`📂 Copying ${dir} -> ${dest}...`);
    const start = Date.now();
    fs.cpSync(src, dest, { recursive: true });
    console.log(`✅ ${dir} copied in ${((Date.now() - start) / 1000).toFixed(2)}s`);
  } else {
    console.warn(`⚠️ Source directory not found: ${src}`);
  }
}

console.log('✨ All learning resources copied to dist/ successfully!');
