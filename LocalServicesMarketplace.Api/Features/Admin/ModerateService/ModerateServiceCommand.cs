using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Admin.ModerateService;

public class ModerateServiceCommand : IRequest<Result<ModerateServiceResponse>>
{
    public int ServiceId { get; set; }
    public required string Action { get; set; } // "approve" or "reject"
    public string? Reason { get; set; } // Required for reject, optional for approve
}