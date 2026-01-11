using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Bookings.CreateBooking;

public class CreateBookingCommand : IRequest<Result<CreateBookingResponse>>
{
    public required string ProviderId { get; set; }
    public int ServiceId { get; set; }

    public DateTime ScheduledDate { get; set; }
    public TimeSpan ScheduledTime { get; set; }

    // Location - where the service should be performed
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public string? CustomerNotes { get; set; }
}

public class CreateBookingResponse
{
    public int BookingId { get; set; }
    public string Message { get; set; } = "Booking created successfully. Waiting for provider confirmation.";
}
