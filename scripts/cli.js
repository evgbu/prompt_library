#!/usr/bin/env node

const command = process.argv[2];

if (command === 'install') {
  process.argv.splice(2, 1); // Shift arguments to make --mode the first arg for install.js
  require('./install.js');
} else if (command === 'uninstall') {
  require('./uninstall.js');
} else {
  console.log('Usage: npx @evg/prompt_library <install|uninstall> [--mode embedded]');
  process.exit(1);
}