# Code Style: Kotlin

> Part of [Code Style Standards](../CODE_STYLE_STANDARDS.md)

---

## Naming Conventions

```kotlin
// ✅ Good
class RecipeParser                  // Classes: PascalCase
fun parseRecipe()                   // Functions: camelCase
val maxRetries = 3                  // Variables: camelCase
const val API_ENDPOINT = "..."      // Constants: UPPER_SNAKE_CASE

// ❌ Bad
class recipeParser                  // Wrong
fun ParseRecipe()                   // Wrong
val MAX_RETRIES = 3                 // val should be camelCase
```

---

## Null Safety

```kotlin
// ✅ Good - Safe null handling
val recipe: Recipe? = getRecipe(id)
recipe?.let {
    processRecipe(it)
}

// ❌ Bad - Force unwrap
val recipe: Recipe? = getRecipe(id)
processRecipe(recipe!!)  // Will crash if null
```

---

## Tools

```bash
# Formatting (ktlint)
ktlint -F

# Linting
./gradlew ktlintCheck

# Testing
./gradlew test
```

---

## Validation Checklist

- [ ] `ktlint` (pass)
- [ ] `./gradlew test` (pass)
- [ ] Null safety used correctly

