using LocalServicesMarketplace.Core.Entities;

namespace LocalServicesMarketplace.Api.Features.Bookings;

public class BookingDto
{
    public int Id { get; set; }

    // Customer info
    public required string CustomerId { get; set; }
    public required string CustomerName { get; set; }
    public string? CustomerPhone { get; set; }

    // Provider info
    public required string ProviderId { get; set; }
    public required string ProviderName { get; set; }
    public string? ProviderBusinessName { get; set; }
    public string? ProviderPhone { get; set; }

    // Service info
    public int ServiceId { get; set; }
    public required string ServiceName { get; set; }
    public required string ServiceCategory { get; set; }

    // Booking details
    public DateTime ScheduledDate { get; set; }
    public TimeSpan ScheduledTime { get; set; }
    public int EstimatedDurationMinutes { get; set; }

    // Location
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }

    // Notes
    public string? CustomerNotes { get; set; }
    public string? ProviderNotes { get; set; }

    // Pricing
    public decimal QuotedPrice { get; set; }
    public decimal? FinalPrice { get; set; }
    public string PriceType { get; set; } = "Fixed";

    // Status
    public string Status { get; set; } = "Pending";
    public string? CancellationReason { get; set; }

    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? CancelledAt { get; set; }

    // Review tracking
    public bool CustomerHasReviewed { get; set; }
    public bool CanReview => Status == "Completed" && !CustomerHasReviewed;
}

public class BookingListItemDto
{
    public int Id { get; set; }

    // For customers - show provider info
    public required string ProviderName { get; set; }
    public string? ProviderBusinessName { get; set; }

    // For providers - show customer info
    public required string CustomerName { get; set; }

    // Service
    public required string ServiceName { get; set; }
    public required string ServiceCategory { get; set; }

    // Booking details
    public DateTime ScheduledDate { get; set; }
    public TimeSpan ScheduledTime { get; set; }

    // Location summary
    public string? City { get; set; }

    // Pricing
    public decimal QuotedPrice { get; set; }
    public string PriceType { get; set; } = "Fixed";

    // Status
    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; }

    // For customer dashboard
    public bool CanReview { get; set; }
}

public static class BookingExtensions
{
    public static BookingDto ToDto(this Booking booking)
    {
        return new BookingDto
        {
            Id = booking.Id,
            CustomerId = booking.CustomerId,
            CustomerName = booking.Customer.FullName,
            CustomerPhone = booking.Customer.PhoneNumber,
            ProviderId = booking.ProviderId,
            ProviderName = booking.Provider.FullName,
            ProviderBusinessName = booking.Provider.BusinessName,
            ProviderPhone = booking.Provider.PhoneNumber,
            ServiceId = booking.ServiceId,
            ServiceName = booking.Service.Name,
            ServiceCategory = booking.Service.Category,
            ScheduledDate = booking.ScheduledDate,
            ScheduledTime = booking.ScheduledTime,
            EstimatedDurationMinutes = booking.EstimatedDurationMinutes,
            Address = booking.Address,
            City = booking.City,
            PostalCode = booking.PostalCode,
            CustomerNotes = booking.CustomerNotes,
            ProviderNotes = booking.ProviderNotes,
            QuotedPrice = booking.QuotedPrice,
            FinalPrice = booking.FinalPrice,
            PriceType = booking.PriceType,
            Status = booking.Status.ToString(),
            CancellationReason = booking.CancellationReason,
            CreatedAt = booking.CreatedAt,
            ConfirmedAt = booking.ConfirmedAt,
            CompletedAt = booking.CompletedAt,
            CancelledAt = booking.CancelledAt,
            CustomerHasReviewed = booking.CustomerHasReviewed
        };
    }

    public static BookingListItemDto ToListItemDto(this Booking booking)
    {
        return new BookingListItemDto
        {
            Id = booking.Id,
            ProviderName = booking.Provider.FullName,
            ProviderBusinessName = booking.Provider.BusinessName,
            CustomerName = booking.Customer.FullName,
            ServiceName = booking.Service.Name,
            ServiceCategory = booking.Service.Category,
            ScheduledDate = booking.ScheduledDate,
            ScheduledTime = booking.ScheduledTime,
            City = booking.City,
            QuotedPrice = booking.QuotedPrice,
            PriceType = booking.PriceType,
            Status = booking.Status.ToString(),
            CreatedAt = booking.CreatedAt,
            CanReview = booking.Status == BookingStatus.Completed && !booking.CustomerHasReviewed
        };
    }
}