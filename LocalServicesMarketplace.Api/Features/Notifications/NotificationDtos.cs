namespace LocalServicesMarketplace.Api.Features.Notifications;

public class NotificationDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Message { get; set; }
    public string Type { get; set; } = "General";
    public int? BookingId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public string TimeAgo { get; set; } = "";
}

public class NotificationSummary
{
    public int UnreadCount { get; set; }
    public int TotalCount { get; set; }
}