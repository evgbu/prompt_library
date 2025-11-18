---
name: update-deps
description: Check for outdated dependencies and update them in package.json
---

# Execution Steps

1. Run the outdated dependencies check script `node_modules/@evg/prompt_library/library/scripts/check-outdated.js` to identify packages that can be updated within their semver ranges. If no packages are outdated, exit the process.
2. Update the identified package versions in package.json to their target versions.
3. Run `npm install` to install the updated dependencies.
4. Run the check script again to validate that all packages are up to date.
