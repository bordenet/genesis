# Shell Scripts: Argument Parsing & Testing

> Part of [Shell Script Standards](../SHELL_SCRIPT_STANDARDS.md)

---

## Argument Parsing

### Standard Pattern

```bash
parse_arguments() {
    # Set defaults
    local mode=""
    local verbose=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                print_usage
                exit 0
                ;;
            --mode)
                mode="$2"
                shift 2
                ;;
            --verbose|-v)
                verbose=true
                shift
                ;;
            --debug)
                export DEBUG=1
                shift
                ;;
            *)
                die "Unknown option: $1 (use --help for usage)"
                ;;
        esac
    done

    # Validate required arguments
    [[ -z "$mode" ]] && die "Missing required argument: --mode"

    # Export for use in script
    MODE="$mode"
    VERBOSE="$verbose"
}
```

---

## Testing

### Validation Checklist

Before committing any script:

- [ ] Script has proper header with PURPOSE and USAGE
- [ ] Uses `source "...lib/common.sh"`
- [ ] Calls `init_script` after sourcing common library
- [ ] Uses `log_*` functions (no raw `echo`)
- [ ] Has `--help` flag that prints usage
- [ ] Uses `readonly` for constants
- [ ] Validates required commands with `require_command`
- [ ] Handles errors with `die` or explicit error messages
- [ ] Uses `get_repo_root` instead of hardcoded `../..`
- [ ] Works when run from any directory

### Manual Testing

```bash
# Test from repository root
cd /path/to/project
./scripts/deploy.sh --help

# Test from script directory
cd /path/to/project/scripts
./deploy.sh --help

# Test with missing dependencies
mv /usr/local/bin/flutter /usr/local/bin/flutter.bak
./scripts/deploy.sh  # Should fail with clear message

# Test error handling
./scripts/deploy.sh --invalid-flag  # Should show usage
```

