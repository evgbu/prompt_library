# prompt_library

This package exposes reusable prompts and automatically syncs them into a consuming repository whenever it is installed or updated.

## Installation

```bash
npm install --save-dev @evg/prompt_library
```

## What happens on install

- The `postinstall` hook runs `scripts/copyPrompts.js` inside the consuming project.
- Prompts from the package's `prompts/` folder are copied into `<project-root>/.github/prompts/`, creating the directories if they do not exist.
- The copy runs any time an install or update hits this package.