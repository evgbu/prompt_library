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

const args = process.argv.slice(2);
const mode = args.includes('--mode') && args[args.indexOf('--mode') + 1] === 'embedded' ? 'embedded' : 'reference';

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

async function copyDir(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
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

  for (const [key, value] of Object.entries(SETTINGS_CONFIG)) {
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

async function updateMcpConfig() {
  await fs.promises.mkdir(VSCODE_DIR, { recursive: true });

  let existingRaw = '';
  let existing = {};

  try {
    existingRaw = await fs.promises.readFile(MCP_CONFIG_PATH, 'utf8');
    existing = JSON.parse(existingRaw);
  } catch (err) {
    if (err.code && err.code !== 'ENOENT') {
      log('Failed to read existing MCP config:', err.message);
    }
    existing = {};
  }

  const merged = { ...existing };

  for (const [key, value] of Object.entries(MCP_CONFIG)) {
    merged[key] = { ...(existing[key] || {}), ...value };
  }

  const newContent = JSON.stringify(merged, null, 2) + '\n';

  if (existingRaw === newContent) {
    log('MCP config already up to date');
    return;
  }

  try {
    await fs.promises.writeFile(MCP_CONFIG_PATH, newContent, 'utf8');
    log('MCP config updated at', MCP_CONFIG_PATH);
  } catch (err) {
    log('Failed to write MCP config:', err.message);
  }
}

async function cleanVscodeSettings() {
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
    log('VS Code settings cleaned at', SETTINGS_PATH);
  } catch (err) {
    log('Failed to write VS Code settings:', err.message);
  }
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

async function copyFolders() {
  for (const folder of LIBRARY_FOLDERS) {
    const src = path.join(SOURCE_DIR, folder);
    if (fs.existsSync(src)) {
      const dest = path.join(DEST_DIR, folder);
      await copyDir(src, dest);
    }
  }
}

async function copyPromptLibraryInstructions(instructionsFile) {
  const instructionsDir = path.join(DEST_DIR, 'instructions');
  await fs.promises.mkdir(instructionsDir, { recursive: true });
  const srcPath = path.join(__dirname, 'assets', instructionsFile);
  const destPath = path.join(instructionsDir, PROMPT_LIBRARY_INSTRUCTIONS_FILE);
  if (await filesDiffer(srcPath, destPath)) {
    await fs.promises.copyFile(srcPath, destPath);
  }
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
  if (!fs.existsSync(SOURCE_DIR)) {
    log('Source prompts folder not found at', SOURCE_DIR);
    return;
  }

  try {
    if (mode === 'embedded') {
      // Clean reference mode artifacts
      await cleanVscodeSettings();
      
      // Apply embedded mode
      await copyInstructionsFiles();
      log('Instructions copied to', DEST_DIR);

      await copyFolders();
      log('Folders copied to', DEST_DIR);
      
      await updateMcpConfig();

      await copyPromptLibraryInstructions('cmn.library.instructions.embed.md');
      log('Embedded instructions copied');
    } else {
      // Clean embedded mode artifacts
      await cleanLibraryFolders();

      // Apply reference mode
      await copyInstructionsFiles();
      log('Instructions copied to', DEST_DIR);

      await updateVscodeSettings();

      await updateMcpConfig();

      await copyPromptLibraryInstructions('cmn.library.instructions.reference.md');
      log('Reference instructions copied');
    }
  } catch (err) {
    log('Failed:', err.message);
  }
}

main();
