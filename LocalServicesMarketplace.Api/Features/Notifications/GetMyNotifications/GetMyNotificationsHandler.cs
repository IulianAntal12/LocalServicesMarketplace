using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Notifications.GetMyNotifications;

public class GetMyNotificationsHandler(
    ApplicationDbContext context,
    ICurrentUserService currentUser)
    : IRequestHandler<GetMyNotificationsQuery, Result<GetMyNotificationsResponse>>
{
    public async Task<Result<GetMyNotificationsResponse>> Handle(
        GetMyNotificationsQuery request,
        CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId;
        if (string.IsNullOrEmpty(userId))
            return Result<GetMyNotificationsResponse>.Unauthorized();

        var query = context.Notifications
            .Where(n => n.UserId == userId)
            .AsQueryable();

        // Filter by read status
        if (request.IsRead.HasValue)
        {
            query = query.Where(n => n.IsRead == request.IsRead.Value);
        }

        // Get summary
        var summary = new NotificationSummary
        {
            UnreadCount = await context.Notifications
                .CountAsync(n => n.UserId == userId && !n.IsRead, cancellationToken),
            TotalCount = await context.Notifications
                .CountAsync(n => n.UserId == userId, cancellationToken)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type.ToString(),
                BookingId = n.BookingId,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                TimeAgo = GetTimeAgo(n.CreatedAt)
            })
            .ToListAsync(cancellationToken);

        return Result<GetMyNotificationsResponse>.Success(new GetMyNotificationsResponse
        {
            Notifications = notifications,
            Summary = summary,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        });
    }

    private static string GetTimeAgo(DateTime dateTime)
    {
        var timeSpan = DateTime.UtcNow - dateTime;

        return timeSpan switch
        {
            { TotalMinutes: < 1 } => "Acum",
            { TotalMinutes: < 60 } => $"Acum {(int)timeSpan.TotalMinutes} min",
            { TotalHours: < 24 } => $"Acum {(int)timeSpan.TotalHours} ore",
            { TotalDays: < 7 } => $"Acum {(int)timeSpan.TotalDays} zile",
            { TotalDays: < 30 } => $"Acum {(int)(timeSpan.TotalDays / 7)} săpt.",
            _ => dateTime.ToString("dd MMM yyyy")
        };
    }
}
