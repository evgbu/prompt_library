const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

// Clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

// Create dist structure
fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(path.join(distDir, 'bin'), { recursive: true });
fs.mkdirSync(path.join(distDir, 'lib'), { recursive: true });

// Copy cli.js to bin/
fs.copyFileSync(
  path.join(__dirname, '..', 'cli.js'),
  path.join(distDir, 'bin', 'cli.js')
);

// Copy folders to lib/
const folders = ['scripts', 'shared', 'library'];
folders.forEach(folder => {
  const src = path.join(__dirname, '..', folder);
  const dest = path.join(distDir, 'lib', folder);
  copyRecursive(src, dest);
});

console.log('Build completed successfully!');
console.log('Output structure:');
console.log('dist/');
console.log('  bin/');
console.log('    cli.js');
console.log('  lib/');
console.log('    scripts/');
console.log('    shared/');
console.log('    library/');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
