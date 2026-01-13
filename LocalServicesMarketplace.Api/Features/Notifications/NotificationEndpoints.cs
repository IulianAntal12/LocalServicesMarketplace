using LocalServicesMarketplace.Api.Endpoints;
using LocalServicesMarketplace.Api.Extensions;
using LocalServicesMarketplace.Api.Features.Notifications.GetMyNotifications;
using LocalServicesMarketplace.Api.Features.Notifications.MarkAsRead;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LocalServicesMarketplace.Api.Features.Notifications;

public class NotificationEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/notifications")
            .WithTags("Notifications")
            .RequireAuthorization();

        // Get my notifications
        group.MapGet("/", GetMyNotificationsAsync)
            .WithName("GetMyNotifications")
            .WithSummary("Get current user's notifications with optional filtering")
            .Produces<GetMyNotificationsResponse>();

        // Get notification summary (unread count)
        group.MapGet("/summary", GetNotificationSummaryAsync)
            .WithName("GetNotificationSummary")
            .WithSummary("Get notification summary (unread and total count)")
            .Produces<NotificationSummary>();

        // Mark single notification as read
        group.MapPost("/{notificationId:int}/read", MarkAsReadAsync)
            .WithName("MarkNotificationAsRead")
            .WithSummary("Mark a single notification as read")
            .Produces<MarkAsReadResponse>();

        // Mark all notifications as read
        group.MapPost("/read-all", MarkAllAsReadAsync)
            .WithName("MarkAllNotificationsAsRead")
            .WithSummary("Mark all unread notifications as read")
            .Produces<MarkAsReadResponse>();
    }

    private static async Task<IResult> GetMyNotificationsAsync(
        [FromQuery] bool? isRead,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        IMediator mediator,
        CancellationToken ct)
    {
        var query = new GetMyNotificationsQuery
        {
            IsRead = isRead,
            Page = page > 0 ? page.Value : 1,
            PageSize = pageSize > 0 && pageSize <= 50 ? pageSize.Value : 20
        };

        var result = await mediator.Send(query, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> GetNotificationSummaryAsync(
        IMediator mediator,
        CancellationToken ct)
    {
        var query = new GetMyNotificationsQuery { PageSize = 1 };
        var result = await mediator.Send(query, ct);

        if (!result.IsSuccess)
            return result.ToApiResponse();

        return Results.Ok(result.Entity!.Summary);
    }

    private static async Task<IResult> MarkAsReadAsync(
        int notificationId,
        IMediator mediator,
        CancellationToken ct)
    {
        var command = new MarkAsReadCommand { NotificationId = notificationId };
        var result = await mediator.Send(command, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> MarkAllAsReadAsync(
        IMediator mediator,
        CancellationToken ct)
    {
        var command = new MarkAsReadCommand();
        var result = await mediator.Send(command, ct);
        return result.ToApiResponse();
    }
}