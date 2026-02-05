# Project Setup: Phase 3 - Dependency Management

> Part of [Project Setup Checklist](../PROJECT_SETUP_CHECKLIST.md)

**Time Estimate**: 1-2 hours

---

## 3.1 Create Setup Script

```bash
# scripts/setup-<platform>.sh
# Copy template from starter-kit/setup-template.sh
```

---

## 3.2 Define Modular Components

```bash
# scripts/setup-components/00-package-manager.sh
install_package_manager() {
  # Homebrew for macOS, apt for Ubuntu, etc.
}

# scripts/setup-components/10-essentials.sh
install_essentials() {
  # git, wget, curl, jq, etc.
}

# scripts/setup-components/20-languages.sh
install_languages() {
  # Node.js, Python, Go, etc.
}

# scripts/setup-components/30-tools.sh
install_tools() {
  # Project-specific CLI tools
}

# scripts/setup-components/40-env.sh
configure_environment() {
  # .env setup, PATH configuration
}
```

---

## 3.3 Implement Main Setup Script

```bash
#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"
init_script

# Source all components
for component in "$SCRIPT_DIR/setup-components"/*.sh; do
  source "$component"
done

# Run installation
log_header "Project Setup"

install_package_manager
install_essentials
install_languages
install_tools
configure_environment

log_success "Setup complete!"
```

---

## 3.4 Test Setup Script

```bash
# Test in Docker container (macOS example)
docker run -it --rm -v $(pwd):/workspace ubuntu:22.04 bash
cd /workspace
./scripts/setup-ubuntu.sh --yes

# Or test on fresh VM
```

---

## Checklist

- [ ] `scripts/setup-<platform>.sh` created
- [ ] Setup components created (modular)
- [ ] Script includes ALL dependencies
- [ ] Script tested on clean machine
- [ ] Documentation updated with setup command

