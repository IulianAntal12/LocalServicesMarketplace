using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Bookings.UpdateBookingStatus;

public class UpdateBookingStatusHandler(
    ApplicationDbContext context,
    ICurrentUserService currentUser)
    : IRequestHandler<UpdateBookingStatusCommand, Result<UpdateBookingStatusResponse>>
{
    public async Task<Result<UpdateBookingStatusResponse>> Handle(
        UpdateBookingStatusCommand request,
        CancellationToken cancellationToken)
    {
        var providerId = currentUser.UserId;
        if (string.IsNullOrEmpty(providerId))
            return Result<UpdateBookingStatusResponse>.Unauthorized();

        var booking = await context.Set<Booking>()
            .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken);

        if (booking == null)
            return Result<UpdateBookingStatusResponse>.NotFound("Booking not found");

        // Only the provider can update booking status
        if (booking.ProviderId != providerId)
            return Result<UpdateBookingStatusResponse>.Forbidden("Only the provider can update booking status");

        if (!Enum.TryParse<BookingStatus>(request.NewStatus, true, out var newStatus))
            return Result<UpdateBookingStatusResponse>.BadRequest("Invalid status");

        // Validate status transitions
        var validationResult = ValidateStatusTransition(booking.Status, newStatus);
        if (!validationResult.IsValid)
            return Result<UpdateBookingStatusResponse>.BadRequest(validationResult.ErrorMessage!);

        // Update booking
        booking.Status = newStatus;
        booking.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(request.ProviderNotes))
            booking.ProviderNotes = request.ProviderNotes;

        switch (newStatus)
        {
            case BookingStatus.Confirmed:
                booking.ConfirmedAt = DateTime.UtcNow;
                break;
            case BookingStatus.Completed:
                booking.CompletedAt = DateTime.UtcNow;
                if (request.FinalPrice.HasValue)
                    booking.FinalPrice = request.FinalPrice.Value;
                break;
            case BookingStatus.Rejected:
                booking.CancelledAt = DateTime.UtcNow;
                booking.CancelledBy = providerId;
                break;
            case BookingStatus.NoShow:
                booking.CancelledAt = DateTime.UtcNow;
                break;
        }

        await context.SaveChangesAsync(cancellationToken);

        var message = newStatus switch
        {
            BookingStatus.Confirmed => "Booking confirmed successfully",
            BookingStatus.InProgress => "Booking marked as in progress",
            BookingStatus.Completed => "Booking completed successfully",
            BookingStatus.Rejected => "Booking rejected",
            BookingStatus.NoShow => "Booking marked as no-show",
            _ => "Booking status updated"
        };

        return Result<UpdateBookingStatusResponse>.Success(new UpdateBookingStatusResponse
        {
            BookingId = booking.Id,
            Status = booking.Status.ToString(),
            Message = message
        });
    }

    private static (bool IsValid, string? ErrorMessage) ValidateStatusTransition(
        BookingStatus currentStatus, BookingStatus newStatus)
    {
        // Define valid transitions
        var validTransitions = new Dictionary<BookingStatus, BookingStatus[]>
        {
            [BookingStatus.Pending] = [BookingStatus.Confirmed, BookingStatus.Rejected],
            [BookingStatus.Confirmed] = [BookingStatus.InProgress, BookingStatus.Cancelled, BookingStatus.NoShow],
            [BookingStatus.InProgress] = [BookingStatus.Completed, BookingStatus.Cancelled],
        };

        if (!validTransitions.TryGetValue(currentStatus, out var allowedStatuses))
            return (false, $"Cannot change status from {currentStatus}");

        if (!allowedStatuses.Contains(newStatus))
            return (false, $"Cannot change status from {currentStatus} to {newStatus}");

        return (true, null);
    }
}
