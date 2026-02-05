# Code Style: Go

> Part of [Code Style Standards](../CODE_STYLE_STANDARDS.md)

---

## Import Organization

```go
import (
    // Standard library
    "context"
    "encoding/json"
    "fmt"

    // Third-party packages
    "github.com/aws/aws-lambda-go/events"
    "github.com/aws/aws-sdk-go-v2/aws"

    // Local packages
    "yourproject/internal/db"
    "yourproject/pkg/models"
)
```

---

## Naming Conventions

```go
// ✅ Good
var bucketName string           // Unexported: camelCase
var userID string               // Acronyms: all caps
func FetchRecipe()              // Exported: PascalCase
const MaxRetries = 3            // Exported constant

// ❌ Bad
var bucket_name string          // No underscores
var UserId string               // Acronyms should be all caps
func fetchRecipe()              // Exported should be PascalCase
```

---

## Error Handling

```go
// ✅ Good - wrapped errors with context
if err != nil {
    return fmt.Errorf("failed to fetch recipe %s: %w", recipeID, err)
}

// ❌ Bad - lost error context
if err != nil {
    return err
}
```

---

## Structured Logging

Use `log/slog`:

```go
import "log/slog"

var logger *slog.Logger

func init() {
    logger = slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
        Level: slog.LevelInfo,
    }))
}

// ✅ Good - structured fields
logger.Info("recipe created",
    "recipeID", recipeID,
    "userID", userID,
    "duration", duration,
)

// ❌ Bad - string formatting
log.Printf("Recipe %s created by user %s", recipeID, userID)
```

---

## Compilation Protocol

**MANDATORY**: Always run `go build` after linting fixes

```bash
# 1. Fix linting errors
golangci-lint run ./...

# 2. CRITICAL: Check compilation
go build

# 3. Only declare work complete after BOTH pass
```

---

## Tools

```bash
# Formatting
gofmt -w .
goimports -w .

# Linting
golangci-lint run ./...

# Testing
go test ./...
```

---

## Validation Checklist

- [ ] `gofmt -w .` (no changes)
- [ ] `golangci-lint run ./...` (pass)
- [ ] `go build` (pass)
- [ ] `go test ./...` (pass)

