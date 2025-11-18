const fs = require('fs');
const path = require('path');

const PACKAGE_NAME = '@evg/prompt_library';
const SOURCE_DIR = path.join(__dirname, '..', 'prompts');
const ROOT_DIR = process.env.INIT_CWD || process.cwd();
const DEST_DIR = path.join(ROOT_DIR, '.github', 'prompts');

function log(...args) {
  console.log('[prompt_library]', ...args);
}

function shouldCopyPrompts() {
  const packageJsonPath = path.join(ROOT_DIR, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log('Skipping prompt copy (no package.json in root).');
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (
      packageJson.devDependencies &&
      Object.prototype.hasOwnProperty.call(packageJson.devDependencies, PACKAGE_NAME)
    ) {
      return true;
    }
  } catch (err) {
    log('Unable to read root package.json:', err.message);
  }

  log('Skipping prompt copy (not installed as devDependency).');
  return false;
}

async function copyDirectory(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  await Promise.all(
    entries.map((entry) => {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        return copyDirectory(srcPath, destPath);
      }

      return fs.promises.copyFile(srcPath, destPath);
    })
  );
}

async function main() {
  if (!shouldCopyPrompts()) {
    return;
  }

  if (!fs.existsSync(SOURCE_DIR)) {
    log('Source prompts folder not found at', SOURCE_DIR);
    return;
  }

  try {
    await copyDirectory(SOURCE_DIR, DEST_DIR);
    log('Prompts copied to', DEST_DIR);
  } catch (err) {
    log('Failed to copy prompts:', err.message);
  }
}

main();
