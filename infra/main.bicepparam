using 'main.bicep'

param environment = 'prod'
param location = 'francecentral'
param projectName = 'groupaiq'
param pgAdminLogin = 'groupaiqadmin'

// Reuse existing OpenAI resource (quota-tight subscription)
param openAiEndpointUrl = 'https://ai-horiquiz-dev.cognitiveservices.azure.com/'
param openAiResourceId = '/subscriptions/ec8bd34d-34d2-4b35-a587-2904775884b1/resourceGroups/rg-horiquiz-dev/providers/Microsoft.CognitiveServices/accounts/ai-horiquiz-dev'

// Secrets — provide at deploy time
param apiKey = readEnvironmentVariable('GROUPAIQ_API_KEY', '')
param pgAdminPassword = readEnvironmentVariable('GROUPAIQ_PG_PASSWORD', '')
