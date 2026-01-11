namespace LocalServicesMarketplace.Core.Entities;

public class Booking
{
    public int Id { get; set; }

    // Relationships
    public required string CustomerId { get; set; }
    public ApplicationUser Customer { get; set; } = null!;

    public required string ProviderId { get; set; }
    public ApplicationUser Provider { get; set; } = null!;

    public int ServiceId { get; set; }
    public Service Service { get; set; } = null!;

    // Booking Details
    public DateTime ScheduledDate { get; set; }
    public TimeSpan ScheduledTime { get; set; }
    public int EstimatedDurationMinutes { get; set; }

    // Location (where the service will be performed)
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    // Customer notes/requirements
    public string? CustomerNotes { get; set; }

    // Pricing
    public decimal QuotedPrice { get; set; }
    public decimal? FinalPrice { get; set; }
    public string PriceType { get; set; } = "Fixed"; // Fixed, Hourly, Quote

    // Status Management
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public string? CancellationReason { get; set; }
    public string? CancelledBy { get; set; } // CustomerId or ProviderId

    // Provider response
    public string? ProviderNotes { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? CancelledAt { get; set; }

    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // For review tracking
    public bool CustomerHasReviewed { get; set; } = false;
}

public enum BookingStatus
{
    Pending = 0,      // Customer created, waiting for provider response
    Confirmed = 1,    // Provider accepted
    InProgress = 2,   // Service is being performed
    Completed = 3,    // Service finished
    Cancelled = 4,    // Cancelled by either party
    Rejected = 5,     // Provider rejected the booking
    NoShow = 6        // Customer didn't show up
}