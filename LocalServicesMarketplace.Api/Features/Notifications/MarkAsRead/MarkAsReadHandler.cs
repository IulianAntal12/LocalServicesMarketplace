using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Notifications.MarkAsRead;

public class MarkAsReadHandler(
    ApplicationDbContext context,
    ICurrentUserService currentUser)
    : IRequestHandler<MarkAsReadCommand, Result<MarkAsReadResponse>>
{
    public async Task<Result<MarkAsReadResponse>> Handle(
        MarkAsReadCommand request,
        CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId;
        if (string.IsNullOrEmpty(userId))
            return Result<MarkAsReadResponse>.Unauthorized();

        int markedCount;

        if (request.NotificationId.HasValue)
        {
            // Mark single notification
            var notification = await context.Notifications
                .FirstOrDefaultAsync(n => n.Id == request.NotificationId.Value && n.UserId == userId, cancellationToken);

            if (notification == null)
                return Result<MarkAsReadResponse>.NotFound("Notificare negăsită");

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
                await context.SaveChangesAsync(cancellationToken);
                markedCount = 1;
            }
            else
            {
                markedCount = 0;
            }
        }
        else
        {
            // Mark all as read
            markedCount = await context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(n => n.IsRead, true)
                    .SetProperty(n => n.ReadAt, DateTime.UtcNow),
                    cancellationToken);
        }

        return Result<MarkAsReadResponse>.Success(new MarkAsReadResponse
        {
            MarkedCount = markedCount,
            Message = markedCount > 0
                ? $"{markedCount} notificări marcate ca citite"
                : "Nicio notificare de marcat"
        });
    }
}
