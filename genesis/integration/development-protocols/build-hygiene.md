# Build Hygiene

> Part of [Development Protocols](../DEVELOPMENT_PROTOCOLS.md)

---

## CRITICAL: Never Modify Source Files In Place

**All build scripts MUST output to a separate `build/` or `dist/` directory.**

```bash
# ❌ WRONG: Modifies source files
./build.sh  # Writes to src/generated.ts

# ✅ CORRECT: Outputs to build directory
./build.sh  # Writes to build/generated.ts
```

**Why**: Prevents accidental source code corruption and ensures reproducible builds.

**If you detect this happening**:
1. IMMEDIATELY alert the user
2. Fix the build scripts (this is a critical error)
3. Work stoppage until fixed

---

## Post-Push Cleanup

**After successful GitHub push**:

1. Remove backwards-looking "Recent Completed Work" sections from `CLAUDE.md`
2. Archive accomplishments to maintain lean documentation focused on:
   - Current issues requiring attention
   - How-to guidance for upcoming work
   - Essential context for development workflow
3. Keep document orientation forward-looking and actionable

**Example Cleanup**:

```markdown
<!-- ❌ Remove these after push -->
## Recent Completed Work
- Added mobile share extension
- Fixed image downloading
- Updated documentation

<!-- ✅ Keep these -->
## Current Focus
- Implement backup/restore functionality

## Known Issues
- Image upload fails for files >10MB (need to implement chunking)
```

