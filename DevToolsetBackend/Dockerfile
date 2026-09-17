FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY DevToolsetBackend/DevToolsetBackend.csproj DevToolsetBackend/
RUN dotnet restore DevToolsetBackend/DevToolsetBackend.csproj

COPY DevToolsetBackend/ DevToolsetBackend/
RUN dotnet publish DevToolsetBackend/DevToolsetBackend.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .

USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "DevToolsetBackend.dll"]
