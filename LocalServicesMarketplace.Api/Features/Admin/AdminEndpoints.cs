using LocalServicesMarketplace.Api.Endpoints;
using LocalServicesMarketplace.Api.Extensions;
using LocalServicesMarketplace.Api.Features.Admin.GetDashboardStats;
using LocalServicesMarketplace.Api.Features.Admin.GetRejectedServices;
using LocalServicesMarketplace.Api.Features.Admin.ModerateService;
using LocalServicesMarketplace.Core.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LocalServicesMarketplace.Api.Features.Admin;

public class AdminEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin")
            .WithTags("Admin")
            .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Admin });

        // Dashboard stats
        group.MapGet("/stats", GetDashboardStatsAsync)
            .WithName("GetAdminDashboardStats")
            .WithSummary("Get admin dashboard statistics")
            .Produces<DashboardStatsDto>();

        // Rejected services (AI rejected or Admin rejected)
        group.MapGet("/services/rejected", GetRejectedServicesAsync)
            .WithName("GetRejectedServices")
            .WithSummary("Get rejected services (AI or Admin rejected)")
            .Produces<GetServicesResponse>();

        // Moderate a service (approve/reject)
        group.MapPost("/services/{serviceId:int}/moderate", ModerateServiceAsync)
            .WithName("ModerateService")
            .WithSummary("Approve or reject a service")
            .Produces<ModerateServiceResponse>();
    }

    private static async Task<IResult> GetDashboardStatsAsync(
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(new GetDashboardStatsQuery(), ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> GetRejectedServicesAsync(
        [FromQuery] int page,
        [FromQuery] int pageSize,
        [FromQuery] bool? onlyAiRejected,
        IMediator mediator,
        CancellationToken ct)
    {
        var query = new GetRejectedServicesQuery
        {
            Page = page > 0 ? page : 1,
            PageSize = pageSize > 0 && pageSize <= 50 ? pageSize : 20,
            OnlyAiRejected = onlyAiRejected
        };

        var result = await mediator.Send(query, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> ModerateServiceAsync(
        int serviceId,
        [FromBody] ModerateServiceCommand command,
        IMediator mediator,
        CancellationToken ct)
    {
        command.ServiceId = serviceId;
        var result = await mediator.Send(command, ct);
        return result.ToApiResponse();
    }
}