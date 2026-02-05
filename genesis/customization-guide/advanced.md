# Genesis Customization: Advanced

> Part of [Customization Guide](../03-CUSTOMIZATION-GUIDE.md)

---

## Conditional Template Sections

Use comments to mark conditional sections:

```html
<!-- IF {{ENABLE_BACKEND}} -->
<div class="backend-section">
  Backend-specific content
</div>
<!-- END IF -->
```

Then in generation script:
```bash
if [ "$ENABLE_BACKEND" = "true" ]; then
  # Keep section
else
  # Remove section
  sed -i '/<!-- IF {{ENABLE_BACKEND}} -->/,/<!-- END IF -->/d' file.html
fi
```

---

## Multi-Language Support

Add language variable:
```json
{
  "i18n": {
    "default_language": "en",
    "supported_languages": ["en", "es", "fr"]
  }
}
```

Create language files:
```
templates/web-app/i18n/
├── en.json
├── es.json
└── fr.json
```

---

## Custom Build Process

Create `templates/scripts/build-template.sh`:
```bash
#!/usr/bin/env bash

source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
init_script

log_header "Building {{PROJECT_TITLE}}"

# Your custom build steps
npm run build
go build ./...

log_success "Build complete"
```

---

## Examples

See `examples/` directory for complete customization examples:
- `examples/minimal/` - Minimal customization
- `examples/one-pager/` - Moderate customization
- `examples/full-featured/` - Maximum customization

---

## Tips

1. **Start simple**: Use minimal example first, add features incrementally
2. **Test often**: Validate after each customization
3. **Document changes**: Update README and architecture docs
4. **Version control**: Commit after each working customization
5. **Ask AI**: Use AI assistant to help with complex customizations

---

**Need help?** See `01-AI-INSTRUCTIONS.md` for AI-assisted customization.

