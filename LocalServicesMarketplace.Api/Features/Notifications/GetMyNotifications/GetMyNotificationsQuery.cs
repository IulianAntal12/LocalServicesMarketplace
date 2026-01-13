using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Notifications.GetMyNotifications;

public class GetMyNotificationsQuery : IRequest<Result<GetMyNotificationsResponse>>
{
    public bool? IsRead { get; set; } // null = all, true = read only, false = unread only
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class GetMyNotificationsResponse
{
    public List<NotificationDto> Notifications { get; set; } = [];
    public NotificationSummary Summary { get; set; } = new();
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}
