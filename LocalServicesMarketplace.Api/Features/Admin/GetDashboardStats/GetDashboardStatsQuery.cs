using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Admin.GetDashboardStats;

public class GetDashboardStatsQuery : IRequest<Result<DashboardStatsDto>>
{
}