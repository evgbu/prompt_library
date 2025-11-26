# prompt_library

This package exposes reusable prompts and automatically syncs them into a consuming repository whenever it is installed or updated.

## Installation

```bash
npm install --save-dev @evg/prompt_library
```

## What happens on install

- The `postinstall` hook runs `scripts/install.js` inside the consuming project. The script configure the repository with settings and files needed to use the prompt library.
- Content from the folder `shared/` folder are copied into `<project-root>/.github/`, creating the directories if they do not exist.
- The copy runs any time an install or update hits this package.