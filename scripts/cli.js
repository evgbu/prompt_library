#!/usr/bin/env node

const command = process.argv[2];

if (command === 'install') {
  require('./install.js');
} else if (command === 'uninstall') {
  require('./uninstall.js');
} else {
  console.log('Usage: npx @evg/prompt_library <install|uninstall>');
  process.exit(1);
}