---
description: Extract code review rules from recent changes and update .github/code-review-rules.md
argument-hint: Reference to changes provided via local changes, commit hash, PR number, or discussion context
tools: ['edit', 'search', 'changes', 'github/github-mcp-server/get_commit', 'github/github-mcp-server/get_file_contents', 'github/github-mcp-server/pull_request_read', 'github/github-mcp-server/search_pull_requests']
---
Extract code review rules from recent changes/fixes and update the `.github/code-review-rules.md` file.

Think step by step:
0. Ensure that the user has provided the necessary context for the changes or basis for creating rules, such as recent changes, commit hashes, PR numbers, or discussion context. If not provided, request it before proceeding. The user input should be unambiguous and specific (E.g. if PR context is used, exact PR should be pointed out).
1. Analyze the specified changes provided by the argument
2. Identify patterns of issues that were caught during manual code review
3. For each issue found, extract:
   - The category of the issue (e.g., naming conventions, error handling, performance, security)
   - The specific rule or guideline that would have prevented it
   - A clear, actionable description of the rule
4. Check if `.github/code-review-rules.md` exists:
   - If it exists, read the current rules
   - If it doesn't exist, create it with appropriate structure
5. Before adding new rules, evaluate:
   - Can this be merged with an existing rule instead of creating a new one?
   - Is this rule general enough to apply to multiple scenarios?
   - Avoid adding overly specific rules that apply to single edge cases
6. Update the file by:
   - Adding new rules under appropriate categories only if they meet the criteria above
   - Merging similar rules rather than duplicating (consolidate and generalize)
   - Using clear, consistent formatting (e.g., bullet points or numbered lists)
   - Organizing rules by category (e.g., ## Code Quality, ## Testing, ## Security)
   - Including concise code examples when a rule would be unclear without them. Don't add examples for straightforward rules.
   - Keeping the total number of rules manageable (aim for quality over quantity)
7. Ensure each rule is:
   - Specific and actionable
   - Based on real, recurring issues (not one-off cases)
   - Written as a positive guideline (what to do) rather than just what to avoid
   - Accompanied by a brief example if the rule is complex or could be misunderstood
8. Add a timestamp or version note at the top indicating when rules were last updated
9. Periodically consolidate rules (every 5-10 updates):
   - Merge overlapping rules
   - Remove rules that haven't been violated in recent reviews
   - Generalize overly specific rules where possible


## Example format for rules with examples:
```
## Error Handling

- **Always validate external input before processing**
  ```javascript
  // Good
  function processUser(data) {
    if (!data?.email || !isValidEmail(data.email)) {
      throw new ValidationError('Invalid email');
    }
    // process...
  }
  
  // Bad
  function processUser(data) {
    const user = createUser(data.email); // No validation
  }
  ```
```