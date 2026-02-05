# Code Style: Swift

> Part of [Code Style Standards](../CODE_STYLE_STANDARDS.md)

---

## Structured Logging

**Use Apple's native `os.Logger`**

```swift
import os

enum AppLogger {
    static let shareExtension = Logger(subsystem: Bundle.main.bundleIdentifier!, category: "ShareExtension")
    static let webView = Logger(subsystem: Bundle.main.bundleIdentifier!, category: "WebView")
    static let network = Logger(subsystem: Bundle.main.bundleIdentifier!, category: "Network")
}

// ✅ Good - Privacy annotation
logger.error("Network request failed",
    url: "\(url, privacy: .private)",
    statusCode: statusCode,
    error: "\(error.localizedDescription)"
)

// ❌ Bad - No privacy annotation
logger.error("Network request failed: \(url)")
```

---

## Privacy Levels

- **Public**: Operation types, counts, durations
- **Private** (default): URLs, recipe titles, user identifiers
- **Sensitive**: Authentication tokens, passwords (never logged)

---

## Log Levels

- **Debug**: Development-only verbose output
- **Info**: Normal operations
- **Notice**: Significant events (cache miss, fallback)
- **Warning**: Recoverable errors
- **Error**: Critical failures
- **Fault**: Unrecoverable errors

---

## Tools

```bash
# Formatting (SwiftFormat)
swiftformat .

# Linting (SwiftLint)
swiftlint

# Testing
xcodebuild test -scheme YourScheme
```

---

## Validation Checklist

- [ ] `swiftlint` (pass)
- [ ] Using `os.Logger` (not `print()`)
- [ ] Privacy annotations on sensitive data

