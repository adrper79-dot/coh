# Cloudflare Pages Project Setup

## Current Status

The deployment configuration has been fixed, but the **Cloudflare Pages project** needs to be created manually or via Cloudflare's dashboard.

## What's Fixed ✅

- ✅ Removed conflicting `main` and `pages_build_output_dir` keys from configuration
- ✅ Created proper `web/wrangler.jsonc` for Pages deployment
- ✅ Updated GitHub Actions to use correct project name `coh`
- ✅ Configuration now passes validation

## What's Needed 🔧

The Cloudflare Pages project `coh` needs to be created in your Cloudflare account.

### Option 1: Create via Cloudflare Dashboard (Fastest)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages**
3. Click **Create a project**
4. Click **Connect to Git** or **Deploy manually**
5. Choose **Deploy manually** if you just want to set up the project
6. Enter project name: `coh`
7. Click **Create project**

Once created, push a commit to trigger the automatic deployment:

```bash
cd /workspaces/coh
git commit --allow-empty -m "Trigger deployment after Pages project creation"
git push origin main
```

### Option 2: Create via Wrangler CLI (with OAuth)

If you have local access to Cloudflare OAuth:

```bash
cd /workspaces/coh/web
wrangler pages project create coh
```

When prompted, authorize the OAuth request in your browser.

### Option 3: Create via API (requires credentials)

If you have your Cloudflare Account ID and API Token, run:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects" \
  -H "Authorization: Bearer {API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "coh",
    "production_branch": "main",
    "deployment_configs": {
      "production": {
        "env_vars": {}
      },
      "preview": {
        "env_vars": {}
      }
    }
  }'
```

## After Project Creation

Once the `coh` Pages project is created in your Cloudflare account:

1. The next GitHub Actions deployment will automatically deploy the frontend
2. You'll be able to access the site at: `https://coh.pages.dev`
3. The API will continue to be deployed at: `https://cypher-of-healing-api.workers.dev`

## Troubleshooting

If deployment still fails with "Project not found":

1. Verify the project name is exactly `coh` (all lowercase) in Cloudflare dashboard
2. Make sure the API token has `pages:write` permission
3. Check that `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` GitHub secrets are correct

## Files Modified

- `wrangler.jsonc` - Root configuration (Workers API only, no Pages config)
- `web/wrangler.jsonc` - Pages configuration (project name: `coh`)
- `wrangler-pages.toml` - Alternative Pages configuration
- `.github/workflows/deploy.yml` - Updated to use project name `coh`
