# Genesis Quick Start Guide

**For Humans**: This is a human-readable quick start. For AI instructions, see [`START-HERE.md`](START-HERE.md).

---

## What is Genesis?

Genesis is a **project template system** that lets you create new AI-assisted workflow applications (like the Product Requirements Assistant) in under 2 hours.

**Use Cases**:
- One-Pager document generator
- ADR (Architecture Decision Record) generator
- PRD (Product Requirements Document) generator
- Any multi-phase AI workflow

---

## Quick Start

### With AI Assistant (Recommended)

1. **Copy Genesis to new repo**:
   ```bash
   git clone https://github.com/yourusername/your-new-repo.git
   cd your-new-repo
   cp -r /path/to/genesis/genesis .
   ```

2. **Open with AI assistant** (Claude, Cursor, Augment, etc.):
   ```
   "I want to create a new project from the Genesis template system.
   Please read genesis/START-HERE.md and help me set it up."
   ```

3. **Answer AI's questions** about your project

4. **Wait for AI to complete setup** (~30-60 minutes)

5. **Visit your GitHub Pages URL** to see your app!

---

### Manual Setup

For manual setup, follow the step-by-step instructions in [`START-HERE.md`](START-HERE.md).

---

## What You Get

### ✅ Complete Web Application
- 100% client-side (no server needed)
- IndexedDB storage (50MB-10GB capacity)
- Dark mode support
- Responsive design
- Export/import functionality

### ✅ GitHub Pages Deployment
- Automatic deployment on push
- Custom domain support
- HTTPS enabled
- CDN-backed (fast worldwide)

### ✅ CI/CD Pipeline
- Automated testing
- Code coverage tracking
- Pre-commit hooks
- Release automation

### ✅ Professional Documentation
- README with badges
- Architecture docs
- Deployment guides
- Contributing guidelines

### ✅ Development Tools
- Setup scripts (macOS, Linux, Windows)
- Validation scripts
- Pre-commit hooks
- Common shell library

---

## Examples

### Hello World
See [`examples/hello-world/`](examples/hello-world/) for a minimal working example.

**Features**:
- 3-phase workflow
- Basic web UI
- No backend
- Full test coverage

**Time to deploy**: <30 minutes

---

### Live Reference Implementations

Study these production projects built with Genesis:

1. **[product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant)** - PRD generator
2. **[one-pager](https://github.com/bordenet/one-pager)** - One-pager generator
3. **[architecture-decision-record](https://github.com/bordenet/architecture-decision-record)** - ADR generator

---

## Troubleshooting

### GitHub Pages shows 404
- Check Settings → Pages is enabled
- Verify source is set to "GitHub Actions"
- Wait 1-2 minutes for deployment

### Web app is blank
- Open browser console (F12)
- Check for JavaScript errors
- Verify all files deployed correctly

### CI pipeline fails
- Check GitHub Actions tab
- Review error logs
- Verify all tests pass locally first

---

## Next Steps

1. **Customize prompts**: Edit files in `prompts/`
2. **Update branding**: Edit `index.html` and `css/styles.css`
3. **Add features**: See [`03-CUSTOMIZATION-GUIDE.md`](03-CUSTOMIZATION-GUIDE.md)
4. **Deploy**: Use `./scripts/deploy-web.sh`

---

## Support

- **Start Here**: [`START-HERE.md`](START-HERE.md)
- **Troubleshooting**: [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)
- **Reference**: [`REFERENCE-IMPLEMENTATIONS.md`](REFERENCE-IMPLEMENTATIONS.md)

---

**Ready to create your first project?** 🚀

Open START-HERE.md with an AI assistant for the easiest experience!

