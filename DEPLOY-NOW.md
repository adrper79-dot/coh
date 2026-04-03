# 🚀 DEPLOY NOW — Quick Start

You have **3 ways** to deploy. Pick one:

---

## ✨ EASIEST: GitHub + Cloudflare (Just 5 Minutes)

### Step 1️⃣: Add Secrets to GitHub
1. Go to: https://github.com/adrper79-dot/coh/settings/secrets/actions
2. Click **New repository secret** and add these (get values below):
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

### Step 2️⃣: Get Cloudflare Credentials
1. **API Token**: 
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token" → Use "Edit Cloudflare Workers" template
   - Verify includes: `Account > Cloudflare Workers > Edit` ✅
   - Copy token → Paste in GitHub secret

2. **Account ID**:
   - Go to: https://dash.cloudflare.com
   - Look bottom right on Overview page
   - Copy → Paste in GitHub secret

### Step 3️⃣: Done! 🎉
- Next push to `main` branch → Auto-deploys
- Watch progress: GitHub → **Actions** tab
- Your site will be live in ~2 minutes!

**Your URLs after deploy:**
- API: https://cypher-of-healing-api.workers.dev
- Frontend: https://coh.pages.dev

---

## 2️⃣ FAST: Run Deploy Script

Already have Cloudflare credentials? Use this:

```bash
cd /workspaces/coh
./deploy.sh YOUR_API_TOKEN YOUR_ACCOUNT_ID
```

Done in ~3 minutes! Same URLs as above.

---

## 3️⃣ MANUAL: Cloudflare UI

1. Go to: https://dash.cloudflare.com/?to=/:account/pages
2. Click **"Connect to Git"**
3. Authorize GitHub and select `adrper79-dot/coh`
4. Build settings:
   - Build command: `cd web && npm run build`
   - Output directory: `web/dist`
5. Click **Deploy**

Done! Auto-deploys on every push to main.

---

## ✅ Verify Deployment

```bash
# Check backend is live
curl https://cypher-of-healing-api.workers.dev/

# Check frontend is live (should show HTML)
curl https://coh.pages.dev/
```

---

## 🔐 After Deployment: Set Secrets

These are needed for the app to fully work:

```bash
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put JWT_SECRET
npx wrangler secret put DATABASE_URL
npx wrangler secret put RESEND_API_KEY
```

When prompted, paste each secret value.

---

## 🆘 Troubleshooting

**GitHub Actions failing?**
- Check: Settings → Secrets and variables → Actions
- Verify all 2 required secrets are added

**API not responding?**
- Make sure you configured secrets in Wrangler
- Check Cloudflare dashboard → Workers → Logs

**Frontend blank?**
- Build might still be processing (takes ~2 min)
- Refresh page in 1-2 minutes

---

**Questions?** See [GITHUB-ACTIONS-SETUP.md](GITHUB-ACTIONS-SETUP.md) for detailed setup.

**Everything working?** 🎉 Congratulations! Your CypherOfHealing platform is live!
