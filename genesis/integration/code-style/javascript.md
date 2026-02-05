# Code Style: JavaScript/TypeScript

> Part of [Code Style Standards](../CODE_STYLE_STANDARDS.md)

---

## Quote Style

**MANDATORY**: Always use double quotes

```javascript
// ✅ Correct
console.log("Starting authentication");
const url = "https://example.com";

// ❌ Wrong
console.log('Starting authentication');
const url = 'https://example.com';
```

**Enforcement**:

```bash
# Always run after editing JavaScript files
npm run lint -- --fix
```

---

## Naming Conventions

```javascript
// ✅ Good
const accessToken = "...";                // Variables: camelCase
function extractRecipeData() {}           // Functions: camelCase
class CognitoAuthManager {}               // Classes: PascalCase
const API_ENDPOINT = "https://...";       // Constants: UPPER_SNAKE_CASE

// ❌ Bad
const access_token = "...";               // No underscores
function ExtractRecipeData() {}           // Functions should be camelCase
class cognitoAuthManager {}               // Classes should be PascalCase
```

---

## Async/Await

```javascript
// ✅ Good - Clear async/await
async function extractRecipe() {
  try {
    const html = await fetchHTML(url);
    const recipe = await parseRecipe(html);
    return recipe;
  } catch (error) {
    console.error("❌ Recipe extraction failed:", error);
    throw error;
  }
}

// ❌ Avoid - Promise chains harder to read
function extractRecipe() {
  return fetchHTML(url)
    .then(html => parseRecipe(html))
    .catch(error => {
      console.error("❌ Recipe extraction failed:", error);
      throw error;
    });
}
```

---

## Error Handling

```javascript
// ✅ Good - Comprehensive error handling
async function authenticateUser(username, password) {
  try {
    const tokens = await cognito.signIn(username, password);
    await storeTokens(tokens);
    return { success: true };
  } catch (error) {
    console.error("❌ Authentication failed:", error);
    return {
      success: false,
      error: error.message || "Authentication failed"
    };
  }
}
```

---

## Logging (Browser Extensions)

```javascript
// ✅ Good - Uses emojis for visual distinction in DevTools
console.log("🎯 your-project content script starting...");
console.log("✅ Recipe extraction completed");
console.error("❌ Failed to authenticate:", error);
console.warn("⚠️ Token validation failed");
```

---

## Tools

```bash
# Linting
npm run lint
npm run lint -- --fix

# Testing
npm test

# Type checking (TypeScript)
npx tsc --noEmit
```

---

## Validation Checklist

- [ ] `npm run lint -- --fix` (no errors)
- [ ] `npm test` (pass)
- [ ] All strings use double quotes

