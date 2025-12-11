using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Providers.UpdateProfile;

public class UpdateProviderProfileCommand : IRequest<Result<UpdateProviderProfileResponse>>
{
    public string? BusinessName { get; set; }
    public string? BusinessDescription { get; set; }
    public decimal? HourlyRate { get; set; }
    public List<string>? ServiceAreas { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int? ServiceRadiusKm { get; set; }
}

public class UpdateProviderProfileResponse
{
    public required string Message { get; set; }
}