using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Admin.GetPendingServices;

public class GetPendingServicesQuery : IRequest<Result<GetServicesResponse>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}