const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..', 'shared');
const ROOT_DIR = process.env.INIT_CWD || process.cwd();
const DEST_DIR = path.join(ROOT_DIR, '.github');

function log(...args) {
  console.log('[prompt_library]', ...args);
}

async function filesDiffer(srcPath, destPath) {
  try {
    await fs.promises.access(destPath);
  } catch {
    return true;
  }

  const [srcContent, destContent] = await Promise.all([
    fs.promises.readFile(srcPath),
    fs.promises.readFile(destPath)
  ]);

  return !srcContent.equals(destContent);
}

async function copyDirectory(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        return copyDirectory(srcPath, destPath);
      }

      if (await filesDiffer(srcPath, destPath)) {
        return fs.promises.copyFile(srcPath, destPath);
      }

      return null;
    })
  );
}

async function main() {
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
