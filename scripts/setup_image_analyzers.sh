#!/bin/bash
# Deploy habitation claims image analyzer with field schema
# Run this after main analyzer setup

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Setting up Image Analyzers for GroupaIQ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$(dirname "$0")/.."

python scripts/setup_demo_analyzers.py

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Image analyzer setup complete"
echo ""
echo "Created analyzers:"
echo "  ✓ habitationClaimsAnalyzer (document)"
echo "  ✓ habitationClaimsImageAnalyzer (image) — NEW"
echo "  ✓ healthUnderwritingAnalyzer (document)"
echo ""
echo "Next: Restart the API or redeploy to Azure Container Apps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
