# DevToolset

DevToolset is a privacy-conscious collection of developer utilities with a Next.js frontend and an ASP.NET Core Web API backend.

## Projects

- `DevToolsetBackend` — ASP.NET Core Web API targeting .NET 10
- `DevToolsetFrontend` — Next.js 15, React 19, and TypeScript application

The frontend exposes tools for JSON formatting, validation, and minification; Base64 and URL encoding; JWT inspection; SHA-256, SHA-384, and SHA-512 hashing; and UUID generation.

## Prerequisites

- .NET 10 SDK
- Node.js 20 or newer
- npm

## Run locally

Start the backend with the HTTP profile:

```powershell
dotnet run --project .\DevToolsetBackend --launch-profile http
```

The backend is available at `http://localhost:5183`. The health endpoint is `GET /api/health`.

The HTTPS profile requires a trusted local .NET developer certificate:

```powershell
dotnet dev-certs https --trust
dotnet run --project .\DevToolsetBackend --launch-profile https
```

Then install and start the frontend:

```powershell
npm ci --prefix .\DevToolsetFrontend
npm run dev --prefix .\DevToolsetFrontend
```

Open `http://localhost:3000`. The frontend proxies browser API calls through `/api-proxy` to the backend URL configured by `DevToolsetFrontend/.env.local`. Copy `DevToolsetFrontend/.env.example` when setting up a new machine.

## Validation

```powershell
dotnet restore .\DevToolsetBackend\DevToolsetBackend.slnx --configfile .\NuGet.Config
dotnet test .\DevToolsetBackend\DevToolsetBackend.slnx --no-restore --configuration Release
dotnet build .\DevToolsetBackend\DevToolsetBackend.slnx --no-restore --configuration Release
npm.cmd ci --prefix .\DevToolsetFrontend
npm.cmd run lint --prefix .\DevToolsetFrontend
npm.cmd run build --prefix .\DevToolsetFrontend
npm.cmd run test:e2e --prefix .\DevToolsetFrontend
```

## API configuration

Local frontend configuration targets the backend HTTP profile:

```text
API_INTERNAL_URL=http://localhost:5183
```

For production, set `API_INTERNAL_URL` to the private API service URL before starting the frontend. In Azure Container Apps this is the internal service name, for example `http://devtoolset-api`; it must not be a public API URL.

## Production deployment

The supported production topology is documented in [`infra/azure/README.md`](infra/azure/README.md). It uses separate frontend and API Container Apps behind one public frontend origin. The API has internal ingress only, and Azure terminates public TLS.

The production images are built from:

- `DevToolsetFrontend/Dockerfile`
- `DevToolsetBackend/Dockerfile`

The GitHub Actions workflows run clean installs, tests, lint/build checks, container builds, and an explicit Azure deployment workflow.

## Notes

JWT decoding is for inspection only. It reads the token header and payload but does not verify the signature, issuer, audience, or expiration.

The API limits request bodies to 1 MiB and applies a fixed-window rate limit per immediate connection IP. Behind the private web proxy, visitors may share a limiter bucket; the default is 600 requests per minute. It deliberately ignores caller-supplied forwarding headers. Tool inputs, JWTs, secrets, and generated output must not be written to application logs.
