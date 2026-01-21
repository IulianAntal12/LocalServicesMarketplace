using LocalServicesMarketplace.Api.Endpoints;
using LocalServicesMarketplace.Api.Extensions;
using LocalServicesMarketplace.Api.Features.Admin.GetDashboardStats;
using LocalServicesMarketplace.Api.Features.Admin.GetPendingServices;
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

        // Pending services (manual moderation needed)
        group.MapGet("/services/pending", GetPendingServicesAsync)
            .WithName("GetPendingServices")
            .WithSummary("Get services pending manual moderation")
            .Produces<GetServicesResponse>();

        // AI Rejected services
        group.MapGet("/services/rejected", GetRejectedServicesAsync)
            .WithName("GetRejectedServices")
            .WithSummary("Get AI-rejected services awaiting admin review")
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

    private static async Task<IResult> GetPendingServicesAsync(
        [FromQuery] int page,
        [FromQuery] int pageSize,
        IMediator mediator,
        CancellationToken ct)
    {
        var query = new GetPendingServicesQuery
        {
            Page = page > 0 ? page : 1,
            PageSize = pageSize > 0 && pageSize <= 50 ? pageSize : 20
        };

        var result = await mediator.Send(query, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> GetRejectedServicesAsync(
        [FromQuery] int page,
        [FromQuery] int pageSize,
        [FromQuery] bool onlyAiRejected,
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
        [FromBody] ModerateServiceRequest request,
        IMediator mediator,
        CancellationToken ct)
    {
        var command = new ModerateServiceCommand
        {
            ServiceId = serviceId,
            Action = request.Action,
            Reason = request.Reason
        };

        var result = await mediator.Send(command, ct);
        return result.ToApiResponse();
    }
}

public class ModerateServiceRequest
{
    public required string Action { get; set; }
    public string? Reason { get; set; }
}