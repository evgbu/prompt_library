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

async function removeDirectory(dirPath) {
  try {
    await fs.promises.rm(dirPath, { recursive: true, force: true });
    log('Removed directory:', dirPath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      log('Failed to remove directory:', dirPath, err.message);
    }
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

  for (const [key, value] of Object.entries(SETTINGS_ENTRIES)) {
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

async function updateGitignore() {
  let content = '';

  try {
    content = await fs.promises.readFile(GITIGNORE_PATH, 'utf8');
  } catch (err) {
    if (err.code !== 'ENOENT') {
      log('Failed to read .gitignore:', err.message);
    }
    return; // If no .gitignore, nothing to remove
  }

  const lines = content.split('\n');
  const filteredLines = lines.filter(line => line.trim() !== GITIGNORE_PATTERN);

  if (filteredLines.length === lines.length) {
    log('.gitignore does not contain', GITIGNORE_PATTERN);
    return;
  }

  const newContent = filteredLines.join('\n') + '\n';

  try {
    await fs.promises.writeFile(GITIGNORE_PATH, newContent, 'utf8');
    log('.gitignore updated, removed', GITIGNORE_PATTERN);
  } catch (err) {
    log('Failed to write .gitignore:', err.message);
  }
}

async function main() {
  try {
    // Remove copied directories and files
    await removeDirectory(path.join(DEST_DIR, 'agents'));
    await removeFile(path.join(DEST_DIR, 'copilot-instructions.md'));

    // Update settings
    await updateVscodeSettings();

    // Update gitignore
    await updateGitignore();

    log('Uninstall cleanup completed');
  } catch (err) {
    log('Failed during uninstall:', err.message);
  }
}

main();