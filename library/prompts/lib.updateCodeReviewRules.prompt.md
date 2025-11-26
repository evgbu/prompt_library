---
name: updateCodeReviewRules
description: Extract code review rules from recent changes and update .github/code-review-rules.md
argument-hint: Reference to changes (e.g., #changes, commit hash, or PR number)
tools: ['edit', 'search', 'githubRepo']
---
Extract code review rules from recent changes/fixes and update the `.github/code-review-rules.md` file.

Think step by step:
1. Analyze the specified changes (via #changes, commit reference, or discussion context)
2. Identify patterns of issues that were caught during manual code review
3. For each issue found, extract:
   - The category of the issue (e.g., naming conventions, error handling, performance, security)
   - The specific rule or guideline that would have prevented it
   - A clear, actionable description of the rule
4. Check if `.github/code-review-rules.md` exists:
   - If it exists, read the current rules
   - If it doesn't exist, create it with appropriate structure
5. Update the file by:
   - Adding new rules under appropriate categories
   - Avoiding duplicate rules (merge with existing if similar)
   - Using clear, consistent formatting (e.g., bullet points or numbered lists)
   - Organizing rules by category (e.g., ## Code Quality, ## Testing, ## Security)
6. Ensure each rule is:
   - Specific and actionable
   - Based on real issues found in the changes
   - Written as a positive guideline (what to do) rather than just what to avoid
7. Add a timestamp or version note at the top indicating when rules were last updated

