# Code Style: Dart/Flutter

> Part of [Code Style Standards](../CODE_STYLE_STANDARDS.md)

---

## Structured Logging

**ALWAYS use `AppLogger` for all Dart/Flutter code**

```dart
import "package:recipe_archive/utils/app_logger.dart";

// ✅ Good - Structured logging with metadata
AppLogger.auth.info("User signed in", metadata: {
  "userId": AppLogger.auth.redact(user.id),
  "email": AppLogger.auth.redact(user.email),
});

// ❌ Bad - Using print() for production logging
print("User signed in: ${user.email}");
```

---

## Log Levels

- `debug()` - Development-only verbose output
- `info()` - Normal operations
- `warning()` - Recoverable errors
- `error()` - Critical failures (include `error` and `stackTrace` parameters)

---

## Privacy Controls

```dart
// ✅ Good - Redacted sensitive data
AppLogger.network.error("API request failed",
  metadata: {
    "url": AppLogger.network.redact(url),
    "statusCode": response.statusCode,
  },
  error: error,
  stackTrace: stackTrace,
);

// ❌ Bad - Exposed sensitive data
AppLogger.network.error("API error: $url");  // NEVER log URLs without redaction
```

---

## Data Classification

**Always Redact**:
- Email addresses
- User IDs
- Recipe titles
- URLs (may contain auth tokens)
- Authentication tokens

**Never Log** (even redacted):
- Passwords
- API keys
- Session data

---

## Tools

```bash
# Formatting
dart format .

# Linting
dart analyze

# Testing
flutter test
```

---

## Validation Checklist

- [ ] `dart analyze` (pass)
- [ ] `flutter test` (pass)
- [ ] Using `AppLogger` (not `print()`)

