---
description: Check for outdated dependencies and update them in package.json
tools: ['edit', 'search', 'runCommands']
---

# Execution Steps

1. Run the outdated dependencies check script `[prompt_library]/scripts/common.check-outdated.js` to identify packages that can be updated within their semver ranges. If no packages are outdated, exit the process.
2. Update the identified package versions in package.json to their target versions.
3. Run `npm update` to install the updated dependencies.
4. Run the check script again to validate that all packages are up to date.
5. Generate a short summary of the changes made.