#!/bin/bash
# =============================================================================
# GroupaIQ — Deploy to Azure Container Apps
# =============================================================================
# Prerequisites:
#   - az CLI authenticated (az login)
#   - Docker (optional — az acr build builds remotely)
#
# Usage:
#   # First-time full deploy (infra + images + apps)
#   ./infra/deploy.sh --full
#
#   # Just rebuild and push images
#   ./infra/deploy.sh --images
#
#   # Just update ACA with new image tags
#   ./infra/deploy.sh --update-apps
# =============================================================================

set -euo pipefail

# Configuration
RESOURCE_GROUP="rg-groupaiq-prod"
LOCATION="francecentral"
PROJECT_NAME="groupaiq"
ENVIRONMENT="prod"
ACR_NAME="acr${PROJECT_NAME}${ENVIRONMENT}"
TAG=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")

echo "============================================="
echo "GroupaIQ Azure Deployment"
echo "============================================="
echo "Resource Group : $RESOURCE_GROUP"
echo "Location       : $LOCATION"
echo "ACR            : $ACR_NAME"
echo "Image Tag      : $TAG"
echo "============================================="

deploy_infra() {
    echo ""
    echo ">>> Step 1: Create Resource Group"
    az group create \
        --name "$RESOURCE_GROUP" \
        --location "$LOCATION" \
        --output none

    echo ">>> Step 2: Deploy Bicep template"
    echo "    You will be prompted for apiKey and pgAdminPassword"

    az deployment group create \
        --resource-group "$RESOURCE_GROUP" \
        --template-file infra/main.bicep \
        --parameters infra/main.bicepparam \
        --query "properties.outputs" \
        --output table
}

build_images() {
    echo ""
    echo ">>> Building backend image: groupaiq-api:$TAG"
    az acr build \
        --registry "$ACR_NAME" \
        --image "groupaiq-api:$TAG" \
        --file Dockerfile \
        . \
        --no-logs \
        --output none

    echo ">>> Building frontend image: groupaiq-frontend:$TAG"
    az acr build \
        --registry "$ACR_NAME" \
        --image "groupaiq-frontend:$TAG" \
        --file frontend/Dockerfile \
        --build-arg "API_URL=https://ca-api-${ENVIRONMENT}.$(az containerapp env show -n cae-${PROJECT_NAME}-${ENVIRONMENT} -g $RESOURCE_GROUP --query 'properties.defaultDomain' -o tsv)" \
        frontend/ \
        --no-logs \
        --output none

    echo ">>> Images pushed: groupaiq-api:$TAG, groupaiq-frontend:$TAG"
}

update_apps() {
    echo ""
    ACR_SERVER=$(az acr show --name "$ACR_NAME" --query loginServer -o tsv)

    echo ">>> Updating API container app with image $ACR_SERVER/groupaiq-api:$TAG"
    az containerapp update \
        --name "ca-api-$ENVIRONMENT" \
        --resource-group "$RESOURCE_GROUP" \
        --image "$ACR_SERVER/groupaiq-api:$TAG" \
        --output none

    echo ">>> Updating Frontend container app with image $ACR_SERVER/groupaiq-frontend:$TAG"
    az containerapp update \
        --name "ca-frontend-$ENVIRONMENT" \
        --resource-group "$RESOURCE_GROUP" \
        --image "$ACR_SERVER/groupaiq-frontend:$TAG" \
        --output none

    echo ""
    echo "============================================="
    echo "Deployment Complete!"
    echo "============================================="
    API_URL=$(az containerapp show -n "ca-api-$ENVIRONMENT" -g "$RESOURCE_GROUP" --query "properties.configuration.ingress.fqdn" -o tsv)
    FRONTEND_URL=$(az containerapp show -n "ca-frontend-$ENVIRONMENT" -g "$RESOURCE_GROUP" --query "properties.configuration.ingress.fqdn" -o tsv)
    echo "API:      https://$API_URL"
    echo "Frontend: https://$FRONTEND_URL"
    echo "============================================="
}

# Parse arguments
case "${1:-}" in
    --full)
        deploy_infra
        build_images
        update_apps
        ;;
    --infra)
        deploy_infra
        ;;
    --images)
        build_images
        ;;
    --update-apps)
        update_apps
        ;;
    *)
        echo "Usage: $0 {--full|--infra|--images|--update-apps}"
        echo ""
        echo "  --full        Deploy infrastructure + build images + update apps"
        echo "  --infra       Deploy Bicep infrastructure only"
        echo "  --images      Build and push Docker images to ACR only"
        echo "  --update-apps Update container apps with latest images only"
        exit 1
        ;;
esac
