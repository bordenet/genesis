# Genesis Deployment: Alternative Hosting

> Part of [Deployment Guide](../04-DEPLOYMENT-GUIDE.md)

---

## Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --dir={{DEPLOY_FOLDER}} --prod
```

---

## Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod {{DEPLOY_FOLDER}}
```

---

## Cloudflare Pages

1. Go to Cloudflare Pages dashboard
2. Connect GitHub repository
3. Set build settings:
   - Build command: (none)
   - Build output directory: `{{DEPLOY_FOLDER}}`
4. Deploy

