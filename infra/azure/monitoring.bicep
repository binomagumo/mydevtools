@description('Region of the Container Apps resources and Log Analytics workspace.')
param location string

param workspaceName string
param webAppName string
param apiAppName string
param alertEmail string

resource workspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' existing = {
  name: workspaceName
}

resource web 'Microsoft.App/containerApps@2023-05-01' existing = {
  name: webAppName
}

resource api 'Microsoft.App/containerApps@2023-05-01' existing = {
  name: apiAppName
}

resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: 'devtoolset-production-alerts'
  location: 'global'
  properties: {
    groupShortName: 'DevTools'
    enabled: true
    emailReceivers: [
      {
        name: 'operator'
        emailAddress: alertEmail
        useCommonAlertSchema: true
      }
    ]
  }
}

var apps = [
  {
    name: webAppName
    id: web.id
  }
  {
    name: apiAppName
    id: api.id
  }
]

resource serverErrors 'Microsoft.Insights/metricAlerts@2018-03-01' = [for app in apps: {
  name: '${app.name}-server-errors'
  location: 'global'
  properties: {
    description: 'Five or more HTTP 5xx responses in five minutes.'
    enabled: true
    severity: 2
    scopes: [app.id]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    autoMitigate: true
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'Http5xx'
          criterionType: 'StaticThresholdCriterion'
          metricNamespace: 'Microsoft.App/containerapps'
          metricName: 'Requests'
          timeAggregation: 'Total'
          operator: 'GreaterThan'
          threshold: 4
          dimensions: [
            {
              name: 'statusCodeCategory'
              operator: 'Include'
              values: ['5xx']
            }
          ]
        }
      ]
    }
    actions: [{ actionGroupId: actionGroup.id }]
  }
}]

resource responseLatency 'Microsoft.Insights/metricAlerts@2018-03-01' = [for app in apps: {
  name: '${app.name}-response-latency'
  location: 'global'
  properties: {
    description: 'Average response time exceeded one second for five minutes.'
    enabled: true
    severity: 2
    scopes: [app.id]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    autoMitigate: true
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'SlowResponses'
          criterionType: 'StaticThresholdCriterion'
          metricNamespace: 'Microsoft.App/containerapps'
          metricName: 'ResponseTime'
          timeAggregation: 'Average'
          operator: 'GreaterThan'
          threshold: 1000
          skipMetricValidation: true
        }
      ]
    }
    actions: [{ actionGroupId: actionGroup.id }]
  }
}]

resource restarts 'Microsoft.Insights/metricAlerts@2018-03-01' = [for app in apps: {
  name: '${app.name}-restarts'
  location: 'global'
  properties: {
    description: 'A replica has restarted more than twice.'
    enabled: true
    severity: 2
    scopes: [app.id]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    autoMitigate: true
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'RepeatedRestarts'
          criterionType: 'StaticThresholdCriterion'
          metricNamespace: 'Microsoft.App/containerapps'
          metricName: 'RestartCount'
          timeAggregation: 'Maximum'
          operator: 'GreaterThan'
          threshold: 2
        }
      ]
    }
    actions: [{ actionGroupId: actionGroup.id }]
  }
}]

resource unhealthyRevisions 'Microsoft.Insights/scheduledQueryRules@2023-12-01' = {
  name: 'devtoolset-unhealthy-revisions'
  location: location
  kind: 'LogAlert'
  properties: {
    displayName: 'DevToolset unhealthy revisions'
    description: 'Container Apps could not provision or run a revision.'
    enabled: true
    severity: 1
    scopes: [workspace.id]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT5M'
    skipQueryValidation: true
    criteria: {
      allOf: [
        {
          query: 'ContainerAppSystemLogs_CL | where Log_s has "Error provisioning revision" or Log_s has "ContainerCrashing"'
          timeAggregation: 'Count'
          operator: 'GreaterThan'
          threshold: 0
        }
      ]
    }
    actions: {
      actionGroups: [actionGroup.id]
    }
  }
}
