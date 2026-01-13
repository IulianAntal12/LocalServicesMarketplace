using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Bookings.CancelBooking;

public class CancelBookingHandler(
    ApplicationDbContext context,
    ICurrentUserService currentUser,
    INotificationService notificationService)
    : IRequestHandler<CancelBookingCommand, Result<CancelBookingResponse>>
{
    public async Task<Result<CancelBookingResponse>> Handle(
        CancelBookingCommand request,
        CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId;
        if (string.IsNullOrEmpty(userId))
            return Result<CancelBookingResponse>.Unauthorized();

        var booking = await context.Set<Booking>()
            .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken);

        if (booking == null)
            return Result<CancelBookingResponse>.NotFound("Booking not found");

        // Both customer and provider can cancel, but with different rules
        var isCustomer = booking.CustomerId == userId;
        var isProvider = booking.ProviderId == userId;

        if (!isCustomer && !isProvider)
            return Result<CancelBookingResponse>.Forbidden("You don't have permission to cancel this booking");

        // Check if booking can be cancelled
        var cancellableStatuses = new[] { BookingStatus.Pending, BookingStatus.Confirmed };
        if (!cancellableStatuses.Contains(booking.Status))
            return Result<CancelBookingResponse>.BadRequest($"Cannot cancel a booking with status: {booking.Status}");

        // Optional: Add time-based restrictions
        // e.g., cannot cancel less than 24 hours before scheduled time
        var scheduledDateTime = booking.ScheduledDate.Add(booking.ScheduledTime);
        var hoursUntilScheduled = (scheduledDateTime - DateTime.UtcNow).TotalHours;

        if (isCustomer && hoursUntilScheduled < 24 && booking.Status == BookingStatus.Confirmed)
        {
            // Could add a late cancellation fee logic here
            // For now, just allow it but could be extended
        }

        // Update booking
        booking.Status = BookingStatus.Cancelled;
        booking.CancellationReason = request.CancellationReason;
        booking.CancelledBy = userId;
        booking.CancelledAt = DateTime.UtcNow;
        booking.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
        await notificationService.SendBookingNotificationAsync(booking, NotificationType.BookingCancelled);

        return Result<CancelBookingResponse>.Success(new CancelBookingResponse
        {
            BookingId = booking.Id,
            Message = isCustomer
                ? "Your booking has been cancelled"
                : "You have cancelled this booking"
        });
    }
}