#!/bin/bash
set -e

# ============================================================
# CypherOfHealing Cloudflare Deployment Script
# ============================================================
# Usage: ./deploy.sh <API_TOKEN> <ACCOUNT_ID>
# ============================================================

if [ $# -lt 2 ]; then
    echo "❌ Missing credentials"
    echo ""
    echo "Usage: ./deploy.sh <CLOUDFLARE_API_TOKEN> <ACCOUNT_ID>"
    echo ""
    echo "Get your credentials:"
    echo "  API Token: https://dash.cloudflare.com/profile/api-tokens"
    echo "  Account ID: https://dash.cloudflare.com (bottom right on Overview)"
    echo ""
    echo "Example:"
    echo "  ./deploy.sh sk_live_abc123xyz456 e1234567890abcdef1234567"
    exit 1
fi

API_TOKEN="$1"
ACCOUNT_ID="$2"

echo "🚀 Deploying CypherOfHealing to Cloudflare..."
echo ""

# Export credentials
export CLOUDFLARE_API_TOKEN="$API_TOKEN"
export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"

# Verify token works
echo "🔐 Verifying Cloudflare credentials..."
if ! curl -s -X GET "https://api.cloudflare.com/client/v4/accounts" \
  -H "Authorization: Bearer $API_TOKEN" | grep -q '"success":true'; then
    echo "❌ Authentication failed. Check your API token."
    exit 1
fi
echo "✅ Credentials verified"
echo ""

# Deploy backend to Cloudflare Workers
echo "📦 Deploying backend API to Cloudflare Workers..."
cd /workspaces/coh
npx wrangler deploy
echo "✅ Backend deployed successfully"
echo ""

# Build and deploy frontend to Cloudflare Pages
echo "🎨 Building and deploying frontend to Cloudflare Pages..."
cd /workspaces/coh/web
npm run build
echo "✅ Frontend built successfully"
echo ""

echo "📤 Uploading frontend to Cloudflare Pages..."
npx wrangler pages deploy dist
echo "✅ Frontend deployed successfully"
echo ""

echo "✨ ============ DEPLOYMENT COMPLETE ============"
echo ""
echo "📍 Your deployed applications:"
echo "  - API: https://cypher-of-healing-api.workers.dev"
echo "  - Frontend: https://coh.pages.dev"
echo ""
echo "⚙️  Configure production secrets:"
echo "  npx wrangler secret put STRIPE_SECRET_KEY"
echo "  npx wrangler secret put STRIPE_WEBHOOK_SECRET"
echo "  npx wrangler secret put JWT_SECRET"
echo "  npx wrangler secret put DATABASE_URL"
echo "  npx wrangler secret put RESEND_API_KEY"
echo ""
echo "🎉 Ready to serve CypherOfHealing!"
