targetScope = 'resourceGroup'

@description('Azure region for the Container Apps environment and Log Analytics workspace.')
param location string = resourceGroup().location

@description('Name of the shared Container Apps environment.')
param environmentName string = 'devtoolset-env'

@description('Public frontend Container App name.')
param webAppName string = 'devtoolset-web'

@description('Private API Container App name.')
param apiAppName string = 'devtoolset-api'

@description('Existing Azure Container Registry name.')
param registryName string

@description('Frontend image including tag.')
param webImage string

@description('API image including tag.')
param apiImage string

@description('Registry username with pull permissions.')
param registryUsername string

@secure()
@description('Registry password or token with pull permissions.')
param registryPassword string

@description('Email address that receives Azure Monitor launch alerts.')
param alertEmail string

resource registry 'Microsoft.ContainerRegistry/registries@2023-11-01-preview' existing = {
  name: registryName
}

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${environmentName}-logs'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource containerEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: environmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: listKeys(logAnalytics.id, '2022-10-01').primarySharedKey
      }
    }
  }
}

resource api 'Microsoft.App/containerApps@2023-05-01' = {
  name: apiAppName
  location: location
  properties: {
    managedEnvironmentId: containerEnvironment.id
    configuration: {
      activeRevisionsMode: 'Multiple'
      secrets: [
        {
          name: 'registry-password'
          value: registryPassword
        }
      ]
      registries: [
        {
          server: registry.properties.loginServer
          username: registryUsername
          passwordSecretRef: 'registry-password'
        }
      ]
      ingress: {
        external: false
        targetPort: 8080
        transport: 'http'
      }
    }
    template: {
      revisionSuffix: 'initial'
      containers: [
        {
          name: 'api'
          image: apiImage
          env: [
            {
              name: 'ASPNETCORE_ENVIRONMENT'
              value: 'Production'
            }
            {
              name: 'ASPNETCORE_URLS'
              value: 'http://+:8080'
            }
          ]
          resources: {
            cpu: 0.5
            memory: '1Gi'
          }
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/api/health'
                port: 8080
                scheme: 'HTTP'
              }
              initialDelaySeconds: 10
              periodSeconds: 30
              timeoutSeconds: 5
              failureThreshold: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/api/health'
                port: 8080
                scheme: 'HTTP'
              }
              initialDelaySeconds: 5
              periodSeconds: 10
              timeoutSeconds: 3
              failureThreshold: 3
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

resource web 'Microsoft.App/containerApps@2023-05-01' = {
  name: webAppName
  location: location
  properties: {
    managedEnvironmentId: containerEnvironment.id
    configuration: {
      activeRevisionsMode: 'Multiple'
      secrets: [
        {
          name: 'registry-password'
          value: registryPassword
        }
      ]
      registries: [
        {
          server: registry.properties.loginServer
          username: registryUsername
          passwordSecretRef: 'registry-password'
        }
      ]
      ingress: {
        external: true
        allowInsecure: false
        targetPort: 3000
        transport: 'http'
      }
    }
    template: {
      revisionSuffix: 'initial'
      containers: [
        {
          name: 'web'
          image: webImage
          env: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'API_INTERNAL_URL'
              value: 'http://${apiAppName}'
            }
          ]
          resources: {
            cpu: 0.5
            memory: '1Gi'
          }
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/healthz'
                port: 3000
                scheme: 'HTTP'
              }
              initialDelaySeconds: 10
              periodSeconds: 30
              timeoutSeconds: 5
              failureThreshold: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/healthz'
                port: 3000
                scheme: 'HTTP'
              }
              initialDelaySeconds: 5
              periodSeconds: 10
              timeoutSeconds: 3
              failureThreshold: 3
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

module monitoring 'monitoring.bicep' = {
  name: '${environmentName}-monitoring'
  params: {
    location: location
    workspaceName: logAnalytics.name
    webAppName: webAppName
    apiAppName: apiAppName
    alertEmail: alertEmail
  }
  dependsOn: [web, api, logAnalytics]
}

output webFqdn string = web.properties.configuration.ingress.fqdn
output privateApiAppName string = apiAppName
