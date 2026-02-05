# Shell Scripts: Full-Featured Script Example

> Part of [Shell Script Standards](../SHELL_SCRIPT_STANDARDS.md) → [Examples](./examples.md)

---

## Deployment Script Example

```bash
#!/usr/bin/env bash

################################################################################
# your-project Deployment Script
################################################################################
# PURPOSE: Deploy application to AWS infrastructure
#   - Validates environment configuration
#   - Builds application artifacts
#   - Deploys to S3 and CloudFront
#   - Invalidates CDN cache
#
# USAGE:
#   ./deploy.sh [OPTIONS]
#
# OPTIONS:
#   --env ENV          Environment (dev, staging, prod)
#   --skip-build       Skip build step (use existing artifacts)
#   --dry-run          Show what would be deployed without deploying
#
# EXAMPLES:
#   ./deploy.sh --env dev
#   ./deploy.sh --env prod --skip-build
#
# DEPENDENCIES:
#   - aws-cli (brew install awscli)
#   - node (brew install node)
################################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"
init_script

readonly REPO_ROOT="$(get_repo_root)"
readonly BUILD_DIR="$REPO_ROOT/build"

# Configuration
ENVIRONMENT=""
SKIP_BUILD=false
DRY_RUN=false

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --env)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --help|-h)
                print_usage
                exit 0
                ;;
            *)
                die "Unknown option: $1"
                ;;
        esac
    done

    [[ -z "$ENVIRONMENT" ]] && die "Missing required argument: --env"

    case "$ENVIRONMENT" in
        dev|staging|prod) ;;
        *) die "Invalid environment: $ENVIRONMENT (must be dev, staging, or prod)" ;;
    esac
}

print_usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Deploy application to AWS infrastructure

Options:
    --env ENV          Environment to deploy to (dev, staging, prod)
    --skip-build       Skip build step
    --dry-run          Show deployment plan without executing
    -h, --help         Show this help message

Examples:
    $(basename "$0") --env dev
    $(basename "$0") --env prod --skip-build
EOF
}

validate_environment() {
    log_section "Validating Environment"
    require_command "aws" "brew install awscli"
    require_command "node" "brew install node"
    require_file "$REPO_ROOT/.env" "Copy .env.example to .env"

    set -a
    source "$REPO_ROOT/.env"
    set +a

    if ! aws sts get-caller-identity &> /dev/null; then
        die "AWS credentials not configured. Run: aws configure"
    fi
    log_success "Environment validated"
}

build_application() {
    if [[ "$SKIP_BUILD" == true ]]; then
        log_section "Skipping Build (using existing artifacts)"
        return 0
    fi
    log_section "Building Application"
    rm -rf "$BUILD_DIR"
    mkdir -p "$BUILD_DIR"
    if ! npm run build; then
        die "Build failed"
    fi
    log_success "Build complete"
}

deploy_to_s3() {
    log_section "Deploying to S3"
    local bucket="app-${ENVIRONMENT}"
    if [[ "$DRY_RUN" == true ]]; then
        log_info "DRY RUN: Would deploy to s3://$bucket"
        return 0
    fi
    if ! aws s3 sync "$BUILD_DIR" "s3://$bucket" --delete; then
        die "S3 deployment failed"
    fi
    log_success "Deployed to S3: s3://$bucket"
}

main() {
    log_header "your-project Deployment - $ENVIRONMENT"
    validate_environment
    build_application
    deploy_to_s3
    log_success "Deployment complete!"
}

parse_arguments "$@"
main
```

