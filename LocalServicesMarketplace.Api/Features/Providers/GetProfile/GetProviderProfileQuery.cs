using LocalServicesMarketplace.Api.Features.SharedDTOs;
using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Providers.GetProfile;

public class GetProviderProfileQuery : IRequest<Result<ProviderProfileResponse>>
{
    public string? ProviderId { get; set; }
}

public class ProviderProfileResponse
{
    public required string Id { get; set; }
    public required string Email { get; set; }
    public required string FullName { get; set; }
    public string? BusinessName { get; set; }
    public string? BusinessDescription { get; set; }
    public decimal? HourlyRate { get; set; }
    public List<string> ServiceAreas { get; set; } = [];
    public double? Rating { get; set; }
    public int TotalReviews { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int ServiceRadiusKm { get; set; }

    public List<ServiceDto> Services { get; set; } = [];
    public List<PortfolioImageDto> PortfolioImages { get; set; } = [];
}