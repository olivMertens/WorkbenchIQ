// =============================================================================
// GroupaIQ — Azure Infrastructure (Bicep)
// Deploys all Azure resources needed for the GroupaIQ application
// =============================================================================

targetScope = 'resourceGroup'

// Parameters
@description('Environment name (dev, staging, prod)')
param environment string = 'prod'

@description('Azure region for deployment')
param location string = resourceGroup().location

@description('Project name used as prefix for resource names')
param projectName string = 'groupaiq'

@secure()
@description('API key for backend authentication (min 32 chars)')
param apiKey string

@description('Azure OpenAI endpoint URL (uses existing resource to avoid quota issues)')
param openAiEndpointUrl string

@description('Azure OpenAI resource ID (for RBAC role assignment)')
param openAiResourceId string

@description('PostgreSQL administrator login')
param pgAdminLogin string = 'groupaiqadmin'

@secure()
@description('PostgreSQL administrator password')
param pgAdminPassword string

// Naming convention
var prefix = '${projectName}-${environment}'
var uniqueSuffix = uniqueString(resourceGroup().id, projectName)

// Tags applied to all resources
var tags = {
  SecurityControl: 'ignore'
  CostControl: 'ignore'
  Project: 'GroupaIQ'
  Environment: environment
}

// =============================================================================
// Log Analytics Workspace (required by Container Apps)
// =============================================================================
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'log-${prefix}'
  location: location
  tags: tags
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

// =============================================================================
// User-Assigned Managed Identity (avoids chicken-and-egg with ACA)
// =============================================================================
resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'id-${prefix}'
  location: location
  tags: tags
}

// =============================================================================
// Container Registry
// =============================================================================
resource acr 'Microsoft.ContainerRegistry/registries@2023-11-01-preview' = {
  name: 'acr${projectName}${environment}'
  location: location
  tags: tags
  sku: { name: 'Basic' }
  properties: {
    adminUserEnabled: false
  }
}

// AcrPull role for managed identity
resource acrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acr.id, managedIdentity.id, 'acrpull')
  scope: acr
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d') // AcrPull
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// =============================================================================
// Storage Account + Blob Container
// =============================================================================
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: 'st${projectName}${uniqueSuffix}'
  location: location
  tags: tags
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    allowSharedKeyAccess: false
    supportsHttpsTrafficOnly: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
}

resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'groupaiq-data'
}

// Storage Blob Data Contributor role for managed identity
resource storageBlobRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, managedIdentity.id, 'blobcontributor')
  scope: storageAccount
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'ba92f5b4-2d11-453d-a403-e96b0029c9fe') // Storage Blob Data Contributor
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// =============================================================================
// Azure OpenAI — Reuse existing resource (pass endpoint + resource ID as params)
// Model deployments (gpt-4.1, gpt-4.1-mini, text-embedding-3-small) already exist.
// Only need RBAC role assignment for the managed identity.
// =============================================================================

// =============================================================================
// Azure Content Understanding (Cognitive Services multi-service)
// =============================================================================
resource contentUnderstanding 'Microsoft.CognitiveServices/accounts@2024-10-01' = {
  name: 'cu-${prefix}'
  location: location
  tags: tags
  kind: 'CognitiveServices'
  sku: { name: 'S0' }
  properties: {
    customSubDomainName: 'cu-${prefix}'
    publicNetworkAccess: 'Enabled'
  }
}

// Cognitive Services User role for managed identity
resource cuRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(contentUnderstanding.id, managedIdentity.id, 'coguser')
  scope: contentUnderstanding
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'a97b65f3-24c7-4388-baec-2e87135dc908') // Cognitive Services User
    principalId: managedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// =============================================================================
// PostgreSQL Flexible Server (with pgvector)
// =============================================================================
resource postgres 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
  name: 'pg-${prefix}'
  location: location
  tags: tags
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    administratorLogin: pgAdminLogin
    administratorLoginPassword: pgAdminPassword
    storage: { storageSizeGB: 32 }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: { mode: 'Disabled' }
  }
}

// Enable pgvector extension
resource pgVectorExtension 'Microsoft.DBforPostgreSQL/flexibleServers/configurations@2024-08-01' = {
  parent: postgres
  name: 'azure.extensions'
  properties: {
    value: 'vector'
    source: 'user-override'
  }
}

// Allow Azure services to connect
resource pgFirewallAzure 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2024-08-01' = {
  parent: postgres
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Database
resource pgDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2024-08-01' = {
  parent: postgres
  name: 'groupaiq'
}

// =============================================================================
// Container Apps Environment
// =============================================================================
resource acaEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: 'cae-${prefix}'
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// =============================================================================
// Container App — API Backend
// =============================================================================
resource apiApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: 'ca-api-${environment}'
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: acaEnv.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8000
        transport: 'http'
        allowInsecure: false
      }
      registries: [
        {
          server: acr.properties.loginServer
          identity: managedIdentity.id
        }
      ]
      secrets: [
        { name: 'api-key', value: apiKey }
        { name: 'pg-password', value: pgAdminPassword }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: '${acr.properties.loginServer}/groupaiq-api:latest'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            { name: 'API_KEY', secretRef: 'api-key' }
            { name: 'AZURE_CLIENT_ID', value: managedIdentity.properties.clientId }
            { name: 'AZURE_CONTENT_UNDERSTANDING_ENDPOINT', value: openAiEndpointUrl }
            { name: 'AZURE_CONTENT_UNDERSTANDING_USE_AZURE_AD', value: 'true' }
            { name: 'AZURE_OPENAI_ENDPOINT', value: openAiEndpointUrl }
            { name: 'AZURE_OPENAI_USE_AZURE_AD', value: 'true' }
            { name: 'AZURE_OPENAI_DEPLOYMENT_NAME', value: 'gpt-4-1' }
            { name: 'AZURE_OPENAI_MODEL_NAME', value: 'gpt-4.1' }
            { name: 'AZURE_OPENAI_CHAT_DEPLOYMENT_NAME', value: 'gpt-4-1-mini' }
            { name: 'AZURE_OPENAI_CHAT_MODEL_NAME', value: 'gpt-4.1-mini' }
            { name: 'AZURE_OPENAI_API_VERSION', value: '2024-10-21' }
            { name: 'STORAGE_BACKEND', value: 'azure_blob' }
            { name: 'AZURE_STORAGE_AUTH_MODE', value: 'default' }
            { name: 'AZURE_STORAGE_ACCOUNT_NAME', value: storageAccount.name }
            { name: 'AZURE_STORAGE_CONTAINER_NAME', value: 'groupaiq-data' }
            { name: 'DATABASE_BACKEND', value: 'postgresql' }
            { name: 'POSTGRESQL_HOST', value: postgres.properties.fullyQualifiedDomainName }
            { name: 'POSTGRESQL_PORT', value: '5432' }
            { name: 'POSTGRESQL_DATABASE', value: 'groupaiq' }
            { name: 'POSTGRESQL_USER', value: pgAdminLogin }
            { name: 'POSTGRESQL_PASSWORD', secretRef: 'pg-password' }
            { name: 'POSTGRESQL_SSL_MODE', value: 'require' }
            { name: 'RAG_ENABLED', value: 'true' }
            { name: 'EMBEDDING_DEPLOYMENT', value: 'text-embedding-3-small' }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
  dependsOn: [acrPullRole]
}

// =============================================================================
// Container App — Frontend
// =============================================================================
resource frontendApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: 'ca-frontend-${environment}'
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: acaEnv.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        allowInsecure: false
      }
      registries: [
        {
          server: acr.properties.loginServer
          identity: managedIdentity.id
        }
      ]
      secrets: [
        { name: 'api-key', value: apiKey }
      ]
    }
    template: {
      containers: [
        {
          name: 'frontend'
          image: '${acr.properties.loginServer}/groupaiq-frontend:latest'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            { name: 'API_URL', value: 'https://${apiApp.properties.configuration.ingress.fqdn}' }
            { name: 'API_KEY', secretRef: 'api-key' }
            { name: 'HOSTNAME', value: '0.0.0.0' }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 2
      }
    }
  }
  dependsOn: [acrPullRole]
}

// =============================================================================
// Outputs
// =============================================================================
output acrLoginServer string = acr.properties.loginServer
output apiAppUrl string = 'https://${apiApp.properties.configuration.ingress.fqdn}'
output frontendAppUrl string = 'https://${frontendApp.properties.configuration.ingress.fqdn}'
output openAiEndpoint string = openAiEndpointUrl
output contentUnderstandingEndpoint string = contentUnderstanding.properties.endpoint
output storageAccountName string = storageAccount.name
output postgresHost string = postgres.properties.fullyQualifiedDomainName
output managedIdentityClientId string = managedIdentity.properties.clientId
