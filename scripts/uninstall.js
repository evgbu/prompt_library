const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..', 'library');
const ROOT_DIR = process.env.INIT_CWD || process.cwd();
const DEST_DIR = path.join(ROOT_DIR, '.github');
const VSCODE_DIR = path.join(ROOT_DIR, '.vscode');
const SETTINGS_PATH = path.join(VSCODE_DIR, 'settings.json');
const SETTINGS_CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets', 'settings.json'), 'utf8'));
const MCP_CONFIG_PATH = path.join(VSCODE_DIR, 'mcp.json');
const MCP_CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets', 'mcp.json'), 'utf8'));
const INSTRUCTIONS_FILES = ['copilot-instructions.md', 'cmn.code-review-rules.md'];
const LIBRARY_FOLDERS = ['agents', 'instructions', 'prompts', 'scripts'];
const PROMPT_LIBRARY_INSTRUCTIONS_FILE = 'cmn.library.instructions.md';

function log(...args) {
  console.log('[prompt_library]', ...args);
}

async function removeFile(filePath) {
  try {
    await fs.promises.unlink(filePath);
    log('Removed file:', filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      log('Failed to remove file:', filePath, err.message);
    }
  }
}

async function updateVscodeSettings() {
  let existing = {};

  try {
    const existingRaw = await fs.promises.readFile(SETTINGS_PATH, 'utf8');
    existing = JSON.parse(existingRaw);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      log('Failed to read VS Code settings:', err.message);
    }
    return; // If no settings file, nothing to remove
  }

  let changed = false;

  for (const [key, value] of Object.entries(SETTINGS_CONFIG)) {
    if (existing[key]) {
      for (const [subKey, subValue] of Object.entries(value)) {
        if (existing[key][subKey] === subValue) {
          delete existing[key][subKey];
          changed = true;
        }
      }
      // If the object is empty, remove the key
      if (Object.keys(existing[key]).length === 0) {
        delete existing[key];
        changed = true;
      }
    }
  }

  if (Object.keys(existing).length === 0) {
    await removeFile(SETTINGS_PATH);
    return;
  }

  if (!changed) {
    log('VS Code settings already clean');
    return;
  }

  const newContent = JSON.stringify(existing, null, 2) + '\n';

  try {
    await fs.promises.writeFile(SETTINGS_PATH, newContent, 'utf8');
    log('VS Code settings updated at', SETTINGS_PATH);
  } catch (err) {
    log('Failed to write VS Code settings:', err.message);
  }
}

async function updateMcpConfig() {
  let existing = {};

  try {
    const existingRaw = await fs.promises.readFile(MCP_CONFIG_PATH, 'utf8');
    existing = JSON.parse(existingRaw);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      log('Failed to read MCP config:', err.message);
    }
    return; // If no config file, nothing to remove
  }

  let changed = false;

  for (const [key, value] of Object.entries(MCP_CONFIG)) {
    if (existing[key]) {
      for (const [subKey, subValue] of Object.entries(value)) {
        if (JSON.stringify(existing[key][subKey]) === JSON.stringify(subValue)) {
          delete existing[key][subKey];
          changed = true;
        }
      }
      // If the object is empty, remove the key
      if (Object.keys(existing[key]).length === 0) {
        delete existing[key];
        changed = true;
      }
    }
  }

  if (Object.keys(existing).length === 0) {
    await removeFile(MCP_CONFIG_PATH);
    return;
  }

  if (!changed) {
    log('MCP config already clean');
    return;
  }

  const newContent = JSON.stringify(existing, null, 2) + '\n';

  try {
    await fs.promises.writeFile(MCP_CONFIG_PATH, newContent, 'utf8');
    log('MCP config updated at', MCP_CONFIG_PATH);
  } catch (err) {
    log('Failed to write MCP config:', err.message);
  }
}

async function removeInstructionFiles() {
  for (const file of INSTRUCTIONS_FILES) {
    await removeFile(path.join(DEST_DIR, file));
  }
  await removeFile(path.join(DEST_DIR, 'instructions', PROMPT_LIBRARY_INSTRUCTIONS_FILE));
}

async function cleanMatchingFiles(src, dest) {
  if (!fs.existsSync(dest)) return;
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await cleanMatchingFiles(srcPath, destPath);
    } else {
      await removeFile(destPath);
    }
  }
  // Check if dest is empty and remove if so
  try {
    const remaining = await fs.promises.readdir(dest);
    if (remaining.length === 0) {
      await fs.promises.rmdir(dest);
      log('Removed empty directory:', dest);
    }
  } catch (err) {
    // Directory might not exist or other error, ignore
  }
}

async function cleanLibraryFolders() {
  for (const folder of LIBRARY_FOLDERS) {
    const destFolder = path.join(DEST_DIR, folder);
    const srcFolder = path.join(SOURCE_DIR, folder);
    if (fs.existsSync(srcFolder)) {
      await cleanMatchingFiles(srcFolder, destFolder);
    }
  }
}

async function main() {
  try {
    // Remove copied files
    await removeInstructionFiles();

    // Remove copied folders
    await cleanLibraryFolders();

    // Update settings
    await updateVscodeSettings();

    await updateMcpConfig();

    log('Uninstall cleanup completed');
  } catch (err) {
    log('Failed during uninstall:', err.message);
  }
}

main();
