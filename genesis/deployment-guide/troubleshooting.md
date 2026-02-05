# Genesis Deployment: Troubleshooting

> Part of [Deployment Guide](../04-DEPLOYMENT-GUIDE.md)

---

## Site Not Loading

**Check deployment status**:
```bash
gh run list --limit 5
gh run view --log
```

**Common issues**:
- GitHub Pages not enabled → Enable in Settings
- Wrong folder selected → Should be `/{{DEPLOY_FOLDER}}`
- 404 errors → Check file paths are relative
- Missing `.nojekyll` → Jekyll may exclude directories; add empty `.nojekyll` file to root

---

## IndexedDB Not Working

**Common issues**:
- HTTPS required → GitHub Pages provides HTTPS automatically
- Private browsing → IndexedDB disabled in private mode
- Storage quota exceeded → Export and clear old projects

---

## Dark Mode Not Working

**Check**:
- Tailwind CSS loaded → View page source, check CDN link
- Browser supports `prefers-color-scheme` → Update browser
- Custom CSS loaded → Check `styles.css` path

---

## Performance Optimization

### Enable Caching

Add to `{{DEPLOY_FOLDER}}/_headers`:
```
/*
  Cache-Control: public, max-age=3600
  
/*.js
  Cache-Control: public, max-age=31536000
  
/*.css
  Cache-Control: public, max-age=31536000
```

### Minify Assets (Optional)

```bash
# Minify CSS
npx csso {{DEPLOY_FOLDER}}/css/styles.css -o {{DEPLOY_FOLDER}}/css/styles.min.css

# Minify JS
npx terser {{DEPLOY_FOLDER}}/js/*.js -o {{DEPLOY_FOLDER}}/js/bundle.min.js
```

---

## Monitoring

### Check Site Status

```bash
# Check if site is up
curl -I {{GITHUB_PAGES_URL}}

# Check response time
curl -w "@-" -o /dev/null -s {{GITHUB_PAGES_URL}} <<'EOF'
time_total: %{time_total}s\n
EOF
```

### Analytics (Optional)

Add to `index.html` before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

**Need help?** See [GitHub Pages documentation](https://docs.github.com/en/pages)

