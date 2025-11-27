# prompt_library

This package exposes reusable prompts and automatically syncs them into a consuming repository whenever it is installed or updated.

## Installation

```bash
npm install --save-dev @evg/prompt_library
```

## What happens on install

- The `postinstall` hook runs `scripts/install.js` inside the consuming project. The script configure the repository with settings and files needed to use the prompt library.
- In reference mode (default), essential instruction files are copied into `<project-root>/.github/`. In embedded mode, the full content from the `library/` folder is copied instead.
- The copy runs any time an install or update hits this package.

## Usage

You can manually run the installation or uninstallation using the CLI:

```bash
npx @evg/prompt_library install [--mode <mode>]
npx @evg/prompt_library uninstall
```

### Modes

- `reference` (default): Configures VS Code settings to reference prompts from the installed package, keeping them linked to the library version for automatic updates.
- `embedded`: Copies prompts and instructions directly into the `.github/` folder, allowing for local customization and direct editing.