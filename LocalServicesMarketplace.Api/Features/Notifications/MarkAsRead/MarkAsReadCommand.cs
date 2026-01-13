using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Notifications.MarkAsRead;

public class MarkAsReadCommand : IRequest<Result<MarkAsReadResponse>>
{
    public int? NotificationId { get; set; } // null = mark all as read
}

public class MarkAsReadResponse
{
    public int MarkedCount { get; set; }
    public string Message { get; set; } = "";
}
