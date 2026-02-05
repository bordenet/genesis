# Genesis Customization: Scripts

> Part of [Customization Guide](../03-CUSTOMIZATION-GUIDE.md)

---

## Add Platform-Specific Dependencies

**Example**: Add Flutter to setup script

Edit `templates/scripts/setup-macos-template.sh`:
```bash
# Add to install_dependencies function
if ! command -v flutter &> /dev/null; then
  log_info "Installing Flutter..."
  brew install flutter
fi
```

---

## Add Custom Validation

Edit `templates/scripts/validate-template.sh`:
```bash
# Add custom validation function
validate_custom() {
  log_section "Custom Validation"
  
  # Your validation logic here
  if [ ! -f "required-file.txt" ]; then
    die "required-file.txt not found"
  fi
  
  log_success "Custom validation passed"
}

# Add to validation tiers
TEST_TIERS[p1]="dependencies builds_core tests_unit validate_custom"
```

