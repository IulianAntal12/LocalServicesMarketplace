using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Admin.GetRejectedServices;

public class GetRejectedServicesQuery : IRequest<Result<GetServicesResponse>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public bool OnlyAiRejected { get; set; } = true; // By default, show only AI rejected
}