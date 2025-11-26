const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..', 'library');
const ROOT_DIR = process.env.INIT_CWD || process.cwd();
const DEST_DIR = path.join(ROOT_DIR, '.github');
const VSCODE_DIR = path.join(ROOT_DIR, '.vscode');
const SETTINGS_PATH = path.join(VSCODE_DIR, 'settings.json');
const SETTINGS_ENTRIES = {
  'chat.promptFilesLocations': {
    'node_modules/@evg/prompt_library/library/prompts': true
  },
  'chat.instructionsFilesLocations': {
    'node_modules/@evg/prompt_library/library/instructions': true
  },
  'chat.modeFilesLocations': {
    'node_modules/@evg/prompt_library/library/agents': true
  }
};
const INSTRUCTIONS_FILES = ['copilot-instructions.md', 'code-review-rules.md'];

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

async function copyInstructionsFiles() {
  await fs.promises.mkdir(DEST_DIR, { recursive: true });
  for (const file of INSTRUCTIONS_FILES) {
    const srcPath = path.join(SOURCE_DIR, file);
    const destPath = path.join(DEST_DIR, file);
    if (await filesDiffer(srcPath, destPath)) {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    log('Source prompts folder not found at', SOURCE_DIR);
    return;
  }

  try {
    await copyInstructionsFiles();
    log('Instructions copied to', DEST_DIR);

    await updateVscodeSettings();
  } catch (err) {
    log('Failed:', err.message);
  }
}

main();
