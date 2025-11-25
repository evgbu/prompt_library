#!/usr/bin/env node

const command = process.argv[2];

if (command === 'uninstall') {
  require('./scripts/uninstall.js');
} else {
  console.log('Usage: npx @evg/prompt_library uninstall');
  process.exit(1);
}