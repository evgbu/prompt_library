---
applyTo: "**"
description: "General instructions for all projects."
---

## Project Instructions
- If `.github/project-conventions.md` exists, follow those project-specific instructions in addition to these general instructions.

## Code Review
- Follow the rules defined in `.github/code-review-rules.md`

## Code Quality
- All code style rules are defined in configuration files: `.eslintrc.json`, `.prettierrc.json`, `.editorconfig`
- Follow these configuration files instead of memorizing rules
- Run `npm run lint` and `npm run format:check` before suggesting changes
- Use `npm run lint:fix` and `npm run format` to auto-correct issues