using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Bookings.GetBooking;

public class GetBookingHandler(
    ApplicationDbContext context,
    ICurrentUserService currentUser)
    : IRequestHandler<GetBookingQuery, Result<BookingDto>>
{
    public async Task<Result<BookingDto>> Handle(
        GetBookingQuery request,
        CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId;
        if (string.IsNullOrEmpty(userId))
            return Result<BookingDto>.Unauthorized();

        var booking = await context.Set<Booking>()
            .Include(b => b.Customer)
            .Include(b => b.Provider)
            .Include(b => b.Service)
            .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken);

        if (booking == null)
            return Result<BookingDto>.NotFound("Booking not found");

        // Only allow customer or provider to view the booking
        if (booking.CustomerId != userId && booking.ProviderId != userId)
            return Result<BookingDto>.Forbidden("You don't have permission to view this booking");

        return Result<BookingDto>.Success(booking.ToDto());
    }
}