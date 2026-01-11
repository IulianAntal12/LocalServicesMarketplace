using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Bookings.GetBooking;

public class GetBookingQuery : IRequest<Result<BookingDto>>
{
    public int BookingId { get; set; }
}
