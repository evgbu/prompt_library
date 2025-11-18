# prompt_library

This package exposes reusable prompts and automatically syncs them into a consuming repository when installed as a dev dependency.

## Installation

```bash
npm install --save-dev @evg/prompt_library
```

## What happens on install

- The `postinstall` hook runs `scripts/copyPrompts.js` inside the consuming project.
- Prompts from the package's `prompts/` folder are copied into `<project-root>/.github/prompts/`, creating the directories if they do not exist.
- The copy only runs when the package is listed under `devDependencies`, so regular dependencies stay untouched.