# DevToolset

DevToolset is a privacy-conscious collection of developer utilities with a Next.js frontend and an ASP.NET Core Web API backend.

## Projects

- `DevToolsetBackend` — ASP.NET Core Web API targeting .NET 10
- `DevToolsetBackend.Tests` — tests for the backend, not a second backend service
- `DevToolsetFrontend` — Next.js 15, React 19, and TypeScript application

The frontend exposes tools for JSON formatting, validation, and minification; Base64 and URL encoding; JWT inspection; SHA-256, SHA-384, and SHA-512 hashing; and UUID generation.

## Prerequisites

- .NET 10 SDK
- Node.js 20 or newer
- npm

## Run locally

Install frontend dependencies once, then start both services from the repository root:

```powershell
npm ci --prefix .\DevToolsetFrontend
npm run dev
```

Open the frontend URL printed in the terminal (usually `http://localhost:3000`). The backend runs at `http://localhost:5183`; stop both with Ctrl+C. The frontend proxies browser API calls through `/api-proxy`. Copy `DevToolsetFrontend/.env.example` to `.env.local` only if you need to change the default local configuration.

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

For production, set `API_INTERNAL_URL` to the private API service URL before starting the frontend. It must not be a public API URL.

## Production deployment

AWS deployment is not configured yet. The existing production Dockerfiles can be used when the AWS setup is chosen:

- `DevToolsetFrontend/Dockerfile`
- `DevToolsetBackend/Dockerfile`

GitHub Actions runs clean installs, tests, lint/build checks, and container builds. Local environment files and generated build artifacts are excluded from Git.

## Notes

JWT decoding is for inspection only. It reads the token header and payload but does not verify the signature, issuer, audience, or expiration.

The API limits request bodies to 1 MiB and applies a fixed-window rate limit per immediate connection IP. Behind the private web proxy, visitors may share a limiter bucket; the default is 600 requests per minute. It deliberately ignores caller-supplied forwarding headers. Tool inputs, JWTs, secrets, and generated output must not be written to application logs.
