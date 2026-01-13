namespace LocalServicesMarketplace.Core.Entities;

public class Notification
{
    public int Id { get; set; }

    // Recipient
    public required string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    // Content
    public required string Title { get; set; }
    public required string Message { get; set; }
    public NotificationType Type { get; set; }

    // Related entities (optional)
    public int? BookingId { get; set; }
    public Booking? Booking { get; set; }

    // Status
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }

    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum NotificationType
{
    BookingCreated,      // Provider receives when customer books
    BookingConfirmed,    // Customer receives when provider confirms
    BookingRejected,     // Customer receives when provider rejects
    BookingStarted,      // Customer receives when provider starts work
    BookingCompleted,    // Customer receives when provider completes
    BookingCancelled,    // Provider receives when customer cancels
    NewReview,           // Provider receives when customer leaves review
    General              // General notifications
}
