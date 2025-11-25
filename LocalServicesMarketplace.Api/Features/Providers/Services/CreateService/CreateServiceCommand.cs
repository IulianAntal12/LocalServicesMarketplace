using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Providers.Services.CreateService;

public class CreateServiceCommand : IRequest<Result<CreateServiceResponse>>
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string Category { get; set; }
    public decimal BasePrice { get; set; }
    public string PriceType { get; set; } = "Hourly";
    public int EstimatedDurationMinutes { get; set; } = 60;
}

public class CreateServiceResponse
{
    public int ServiceId { get; set; }
    public required string Message { get; set; }
}