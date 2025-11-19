---
applyTo: "**"
description: "General instructions for all projects. Load project specific instructions from `./project-conventions.md` if existing."
---
## Prompt library
- When request assets from [prompt_library] use path `node_modules/@evg/prompt_library/library/`

## Project Instructions
- IMPORTANT: Load project specific instructions if existing from `./project-conventions.md`. Use such rules over these general instructions.

## Code Quality
- All code style rules are defined in configuration files: `.eslintrc.json`, `.prettierrc.json`, `.editorconfig`
- Follow these configuration files instead of memorizing rules
- Run `npm run lint` and `npm run format:check` before suggesting changes
- Use `npm run lint:fix` and `npm run format` to auto-correct issues