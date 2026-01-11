using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Bookings.UpdateBookingStatus;

// Command
public class UpdateBookingStatusCommand : IRequest<Result<UpdateBookingStatusResponse>>
{
    public int BookingId { get; set; }
    public required string NewStatus { get; set; } // Confirmed, InProgress, Completed, Rejected
    public string? ProviderNotes { get; set; }
    public decimal? FinalPrice { get; set; } // Can be set when completing
}

public class UpdateBookingStatusResponse
{
    public int BookingId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
