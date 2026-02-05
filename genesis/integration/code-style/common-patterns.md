# Code Style: Common Patterns Across All Languages

> Part of [Code Style Standards](../CODE_STYLE_STANDARDS.md)

---

## Core Principles

1. **Consistency over cleverness** - Code should be readable and maintainable
2. **Explicit over implicit** - Make intentions clear
3. **Fail fast** - Validate inputs early, handle errors explicitly
4. **Document the "why"** - Code shows "what", comments explain "why"

---

## Structured Logging Best Practices

**DO**:
- ✅ Use dedicated logging libraries (not `print`/`console.log` for production)
- ✅ Include context fields (userID, requestID, operation type)
- ✅ Add performance tracking (duration, latency)
- ✅ Redact sensitive data (emails, URLs, user IDs)
- ✅ Use appropriate log levels

**DON'T**:
- ❌ Log authentication tokens, passwords, API keys
- ❌ Log in tight loops (impacts performance)
- ❌ Use string interpolation without privacy controls
- ❌ Mix user-facing and operational logging

---

## Privacy-First Logging

**Always redact**:
- Email addresses
- User IDs / UUIDs
- Recipe titles (may contain personal information)
- URLs (may contain query parameters or tokens)
- IP addresses
- Session tokens

**Never log** (even redacted):
- Passwords
- API keys
- OAuth tokens
- Credit card numbers
- Social security numbers

---

## Error Handling

**All languages should**:
1. Validate inputs early
2. Provide context in error messages
3. Include relevant identifiers (IDs, names)
4. Log errors with structured data
5. Never swallow errors silently

---

## Performance Logging

**Always include timing for**:
- API requests (HTTP calls)
- Database operations (S3, DynamoDB)
- External service calls (OpenAI, Cognito)
- Heavy computations (recipe parsing, normalization)
- User-visible operations (sign in, recipe save)

**Example pattern** (all languages):
```
1. Record start time
2. Perform operation
3. Calculate duration
4. Log with duration metadata
```

---

## Customization for Your Project

**To adopt for your project**:

1. Copy the standards to `docs/CODING_STANDARDS.md`
2. Remove languages you don't use
3. Add project-specific conventions
4. Add to linter configurations
5. Reference in code reviews

**Project-Specific Extensions**:

```markdown
## ProjectName Conventions

### API Naming
- REST endpoints: `/api/v1/resource-name`
- GraphQL queries: `camelCase`
- Database tables: `snake_case`

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Tests: `*.test.ts`
```

