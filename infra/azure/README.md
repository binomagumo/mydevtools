# Azure Container Apps deployment

The production topology is one public origin backed by two Container Apps in the same environment:

- `devtoolset-web`: external HTTPS ingress on port 443, forwarding to container port 3000.
- `devtoolset-api`: internal HTTP ingress on port 8080, reachable by the web app as `http://devtoolset-api`.

The API must not be given external ingress. Azure terminates public TLS at the web app ingress; the containers use HTTP internally.

## Provisioning

1. Create a resource group and an Azure Container Registry. `main.bicep` creates the Container Apps environment, the 30-day Log Analytics workspace, both apps, and the alert rules.
2. Build and push both images with immutable tags, for example the commit SHA:

```powershell
docker build -f .\DevToolsetBackend\Dockerfile -t <registry>.azurecr.io/devtoolset-api:<sha> .
docker build -f .\DevToolsetFrontend\Dockerfile -t <registry>.azurecr.io/devtoolset-web:<sha> .\DevToolsetFrontend
docker push <registry>.azurecr.io/devtoolset-api:<sha>
docker push <registry>.azurecr.io/devtoolset-web:<sha>
```

3. Deploy `main.bicep` with the image tags, registry pull credentials, and an operator email for alerts. Keep the registry password in a secret store or CI secret; never commit it or print it in logs.

```powershell
az deployment group create `
  --resource-group <resource-group> `
  --template-file .\infra\azure\main.bicep `
  --parameters registryName=<registry> `
               registryUsername=<pull-username> `
               registryPassword=<pull-password> `
               alertEmail=<operator-email> `
               webImage=<registry>.azurecr.io/devtoolset-web:<sha> `
               apiImage=<registry>.azurecr.io/devtoolset-api:<sha>
```

The example is schematic. Supply the password through a secure parameter source in your deployment environment rather than typing it into a shared terminal. Confirm that the action group sends a test notification to the operator before launch.

## Automated releases

Configure a GitHub `production` environment. Set repository variables `AZURE_RESOURCE_GROUP` and `AZURE_REGISTRY` (the registry name). Set secrets `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID` for an Azure workload identity with a GitHub OIDC federated credential. Grant it permissions to push to the registry and update the two Container Apps.

Run the `Deploy Azure Container Apps` workflow from the commit to release. It reruns CI, builds both images with the commit SHA, pins the current revisions, deploys two new revisions, waits for healthy probes, switches traffic, and runs `smoke.sh` against the public HTTPS origin. A failed smoke check restores the previous traffic weights. The workflow expects each app to have one revision receiving 100% of traffic before it starts.

## Revision rollout and rollback

Deploy each new image with a unique revision suffix. The release workflow waits for both revisions to become healthy, moves traffic, then tests `/healthz`, the API proxy, every tool route, and security headers. Check revision status and traffic after deployment:

```powershell
az containerapp revision list -g <resource-group> -n devtoolset-web -o table
az containerapp revision list -g <resource-group> -n devtoolset-api -o table
az containerapp ingress traffic set -g <resource-group> -n devtoolset-web --revision-weight <revision-name>=100
az containerapp ingress traffic set -g <resource-group> -n devtoolset-api --revision-weight <revision-name>=100
```

If the new revision fails smoke checks, route 100% of traffic back to the last known-good revision with the same command. Keep the failed revision available long enough to inspect logs, then deactivate it deliberately.

## Custom domain and TLS

Add the custom hostname to `devtoolset-web`, create the DNS validation records, then bind an Azure-managed certificate:

```powershell
az containerapp hostname add -g <resource-group> -n devtoolset-web --hostname <domain>
az containerapp hostname list -g <resource-group> -n devtoolset-web -o table
az containerapp hostname bind -g <resource-group> -n devtoolset-web --hostname <domain> --environment <environment> --validation-method CNAME
```

Use `HTTP` validation for an apex A record. Confirm the domain is secured before switching production traffic. See the [Azure managed certificate guide](https://learn.microsoft.com/en-us/azure/container-apps/custom-domains-managed-certificates).

## Monitoring

The Bicep template sends console and system logs to Log Analytics for 30 days. `monitoring.bicep` creates email alerts for HTTP 5xx spikes, response latency, replica restarts, and revision provisioning failures. Verify the alert rules and a test notification in Azure Monitor after provisioning. The response-time metric is in preview and should be checked for availability in the chosen region.

HTTP ingress logs are not enabled: Azure records raw request paths and query strings in that feed, which could contain user-supplied secrets. Application logs must never include request bodies, JWTs, secrets, or tool output. Keep tool inputs in POST bodies rather than URLs.

## First-release sign-off

The workflow validates the default Container Apps hostname after each release. Before announcing the custom domain, an operator must also:

- Confirm both revisions are healthy and the API app still has `external: false` ingress.
- Run `bash infra/azure/smoke.sh https://<domain>` against the bound custom hostname, check HTTPS and HTTP-to-HTTPS behavior, and inspect the response headers in a browser.
- Confirm the action-group email arrives and the latency metric and system-log query produce data in the chosen region.
- Exercise a manual traffic rollback to the previous web and API revisions, rerun the smoke test, then restore the intended revisions.
- Verify the privacy contact route is reachable and monitored, and perform a manual keyboard, screen-reader, contrast, 200% zoom, and mobile screenshot review.

This sign-off cannot be completed by CI without an Azure subscription, registry, DNS, and a domain controlled by the operator.
