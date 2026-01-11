using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Bookings.CancelBooking;

public class CancelBookingCommand : IRequest<Result<CancelBookingResponse>>
{
    public int BookingId { get; set; }
    public string? CancellationReason { get; set; }
}

public class CancelBookingResponse
{
    public int BookingId { get; set; }
    public string Message { get; set; } = "Booking cancelled successfully";
}
