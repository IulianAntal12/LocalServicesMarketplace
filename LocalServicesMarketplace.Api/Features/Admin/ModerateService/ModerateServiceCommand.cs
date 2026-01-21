using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Admin.ModerateService;

public class ModerateServiceCommand : IRequest<Result<ModerateServiceResponse>>
{
    public int ServiceId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Reason { get; set; }
}