using LocalServicesMarketplace.Api.Services.Implementations;
using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Bookings.CreateBooking;

public class CreateBookingHandler(
    ApplicationDbContext context,
    ICurrentUserService currentUser,
    INotificationService notificationService)
    : IRequestHandler<CreateBookingCommand, Result<CreateBookingResponse>>
{
    public async Task<Result<CreateBookingResponse>> Handle(
        CreateBookingCommand request,
        CancellationToken cancellationToken)
    {
        var customerId = currentUser.UserId;
        if (string.IsNullOrEmpty(customerId))
            return Result<CreateBookingResponse>.Unauthorized();

        // Verify provider exists and is active
        var provider = await context.Users
            .FirstOrDefaultAsync(u => u.Id == request.ProviderId && u.IsActive, cancellationToken);

        if (provider == null)
            return Result<CreateBookingResponse>.NotFound("Provider not found");

        // Verify service exists, belongs to provider, and is active
        var service = await context.Services
            .FirstOrDefaultAsync(s =>
                s.Id == request.ServiceId &&
                s.ProviderId == request.ProviderId &&
                s.IsActive,
                cancellationToken);

        if (service == null)
            return Result<CreateBookingResponse>.NotFound("Service not found or not available");

        // Check customer is not booking their own service
        if (customerId == request.ProviderId)
            return Result<CreateBookingResponse>.BadRequest("You cannot book your own service");

        // Check for existing pending/confirmed booking at same time
        var existingBooking = await context.Set<Booking>()
            .AnyAsync(b =>
                b.ProviderId == request.ProviderId &&
                b.ScheduledDate == request.ScheduledDate.Date &&
                b.ScheduledTime == request.ScheduledTime &&
                (b.Status == BookingStatus.Pending || b.Status == BookingStatus.Confirmed),
                cancellationToken);

        if (existingBooking)
            return Result<CreateBookingResponse>.BadRequest("This time slot is not available");

        // Get customer info for location defaults
        var customer = await context.Users
            .FirstOrDefaultAsync(u => u.Id == customerId, cancellationToken);

        var booking = new Booking
        {
            CustomerId = customerId,
            ProviderId = request.ProviderId,
            ServiceId = request.ServiceId,
            ScheduledDate = request.ScheduledDate.Date,
            ScheduledTime = request.ScheduledTime,
            EstimatedDurationMinutes = service.EstimatedDurationMinutes,
            Address = request.Address ?? customer?.Address,
            City = request.City ?? customer?.City,
            PostalCode = request.PostalCode ?? customer?.PostalCode,
            Latitude = request.Latitude ?? customer?.Latitude,
            Longitude = request.Longitude ?? customer?.Longitude,
            CustomerNotes = request.CustomerNotes,
            QuotedPrice = service.BasePrice,
            PriceType = service.PriceType,
            Status = BookingStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        context.Set<Booking>().Add(booking);
        await context.SaveChangesAsync(cancellationToken);
        await notificationService.SendBookingNotificationAsync(booking, NotificationType.BookingCreated);

        return Result<CreateBookingResponse>.Success(new CreateBookingResponse
        {
            BookingId = booking.Id
        });
    }
}
