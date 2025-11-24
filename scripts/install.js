const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..', 'shared');
const ROOT_DIR = process.env.INIT_CWD || process.cwd();
const DEST_DIR = path.join(ROOT_DIR, '.github');
const VSCODE_DIR = path.join(ROOT_DIR, '.vscode');
const SETTINGS_PATH = path.join(VSCODE_DIR, 'settings.json');
const GITIGNORE_PATH = path.join(ROOT_DIR, '.gitignore');
const SETTINGS_ENTRIES = {
  'chat.promptFilesLocations': {
    'node_modules/@evg/prompt_library/library/prompts': true
  },
  'chat.instructionsFilesLocations': {
    'node_modules/@evg/prompt_library/library/instructions': true
  },
  'chat.agentsFilesLocations': {
    'node_modules/@evg/prompt_library/library/agents': true
  }
};
const GITIGNORE_PATTERN = '.github/agents/lib.*.agent.md';

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

async function updateVscodeSettings() {
  await fs.promises.mkdir(VSCODE_DIR, { recursive: true });

  let existingRaw = '';
  let existing = {};

  try {
    existingRaw = await fs.promises.readFile(SETTINGS_PATH, 'utf8');
    existing = JSON.parse(existingRaw);
  } catch (err) {
    if (err.code && err.code !== 'ENOENT') {
      log('Failed to read existing VS Code settings:', err.message);
    }
    existing = {};
  }

  const merged = { ...existing };

  for (const [key, value] of Object.entries(SETTINGS_ENTRIES)) {
    merged[key] = { ...(existing[key] || {}), ...value };
  }

  const newContent = JSON.stringify(merged, null, 2) + '\n';

  if (existingRaw === newContent) {
    log('VS Code settings already up to date');
    return;
  }

  try {
    await fs.promises.writeFile(SETTINGS_PATH, newContent, 'utf8');
    log('VS Code settings updated at', SETTINGS_PATH);
  } catch (err) {
    log('Failed to write VS Code settings:', err.message);
  }
}

async function updateGitignore() {
  
  let content = '';

  try {
    content = await fs.promises.readFile(GITIGNORE_PATH, 'utf8');
  } catch (err) {
    if (err.code !== 'ENOENT') {
      log('Failed to read .gitignore:', err.message);
      return;
    }
    // File doesn't exist, will create with pattern
  }

  const lines = content.split('\n').map(line => line.trim());
  if (lines.includes(GITIGNORE_PATTERN)) {
    log('.gitignore already contains', GITIGNORE_PATTERN);
    return;
  }

  const newContent = content ? content + '\n' + GITIGNORE_PATTERN + '\n' : GITIGNORE_PATTERN + '\n';

  try {
    await fs.promises.writeFile(GITIGNORE_PATH, newContent, 'utf8');
    log('.gitignore updated with', GITIGNORE_PATTERN);
  } catch (err) {
    log('Failed to write .gitignore:', err.message);
  }
}

async function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    log('Source prompts folder not found at', SOURCE_DIR);
    return;
  }

  try {
    await copyDirectory(SOURCE_DIR, DEST_DIR);
    log('Prompts copied to', DEST_DIR);
    await updateVscodeSettings();
    await updateGitignore();
  } catch (err) {
    log('Failed:', err.message);
  }
}

main();
