FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY LocalServicesMarketplace.Api/LocalServicesMarketplace.Api.csproj LocalServicesMarketplace.Api/
COPY LocalServicesMarketplace.Core/LocalServicesMarketplace.Core.csproj LocalServicesMarketplace.Core/
COPY LocalServicesMarketplace.Infrastructure/LocalServicesMarketplace.Infrastructure.csproj LocalServicesMarketplace.Infrastructure/
RUN dotnet restore LocalServicesMarketplace.Api/LocalServicesMarketplace.Api.csproj

# Copy everything and publish
COPY . .
RUN dotnet publish LocalServicesMarketplace.Api/LocalServicesMarketplace.Api.csproj -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080
ENTRYPOINT ["dotnet", "LocalServicesMarketplace.Api.dll"]
