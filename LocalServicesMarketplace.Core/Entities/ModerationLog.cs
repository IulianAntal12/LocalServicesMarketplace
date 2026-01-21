namespace LocalServicesMarketplace.Core.Entities;

public class ModerationLog
{
    public int Id { get; set; }
    public int ServiceId { get; set; }
    public ModerationStatus OldStatus { get; set; }
    public ModerationStatus NewStatus { get; set; }
    public string? Reason { get; set; }
    public string? ModeratedBy { get; set; } // null = AI, otherwise Admin UserId
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Service Service { get; set; } = null!;
    public ApplicationUser? Moderator { get; set; }
}