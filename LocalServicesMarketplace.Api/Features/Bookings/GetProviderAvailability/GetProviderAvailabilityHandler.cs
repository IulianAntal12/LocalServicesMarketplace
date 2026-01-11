using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Bookings.GetProviderAvailability;

public class GetProviderAvailabilityHandler(ApplicationDbContext context)
    : IRequestHandler<GetProviderAvailabilityQuery, Result<ProviderAvailabilityResponse>>
{
    // Default working hours
    private static readonly TimeSpan WorkDayStart = new(8, 0, 0);  // 8:00 AM
    private static readonly TimeSpan WorkDayEnd = new(18, 0, 0);   // 6:00 PM
    private static readonly int SlotDurationMinutes = 60;

    public async Task<Result<ProviderAvailabilityResponse>> Handle(
        GetProviderAvailabilityQuery request,
        CancellationToken cancellationToken)
    {
        // Verify provider exists
        var provider = await context.Users
            .FirstOrDefaultAsync(u => u.Id == request.ProviderId && u.IsActive, cancellationToken);

        if (provider == null)
            return Result<ProviderAvailabilityResponse>.NotFound("Provider not found");

        // Get existing bookings for the date
        var existingBookings = await context.Set<Booking>()
            .Where(b =>
                b.ProviderId == request.ProviderId &&
                b.ScheduledDate == request.Date.Date &&
                (b.Status == BookingStatus.Pending ||
                 b.Status == BookingStatus.Confirmed ||
                 b.Status == BookingStatus.InProgress))
            .Select(b => new
            {
                b.Id,
                b.ScheduledTime,
                b.EstimatedDurationMinutes
            })
            .ToListAsync(cancellationToken);

        // Generate time slots
        var availableSlots = new List<TimeSlot>();
        var bookedSlots = new List<TimeSlot>();

        var currentSlot = WorkDayStart;
        while (currentSlot < WorkDayEnd)
        {
            var slotEnd = currentSlot.Add(TimeSpan.FromMinutes(SlotDurationMinutes));

            // Check if this slot overlaps with any existing booking
            var conflictingBooking = existingBookings.FirstOrDefault(b =>
            {
                var bookingEnd = b.ScheduledTime.Add(TimeSpan.FromMinutes(b.EstimatedDurationMinutes));
                // Check for overlap
                return currentSlot < bookingEnd && slotEnd > b.ScheduledTime;
            });

            if (conflictingBooking != null)
            {
                bookedSlots.Add(new TimeSlot
                {
                    StartTime = conflictingBooking.ScheduledTime,
                    EndTime = conflictingBooking.ScheduledTime.Add(
                        TimeSpan.FromMinutes(conflictingBooking.EstimatedDurationMinutes)),
                    IsAvailable = false,
                    BookingId = conflictingBooking.Id
                });
            }
            else
            {
                // Only show future slots if the date is today
                if (request.Date.Date > DateTime.UtcNow.Date ||
                    (request.Date.Date == DateTime.UtcNow.Date &&
                     currentSlot > DateTime.UtcNow.TimeOfDay.Add(TimeSpan.FromHours(1))))
                {
                    availableSlots.Add(new TimeSlot
                    {
                        StartTime = currentSlot,
                        EndTime = slotEnd,
                        IsAvailable = true
                    });
                }
            }

            currentSlot = slotEnd;
        }

        return Result<ProviderAvailabilityResponse>.Success(new ProviderAvailabilityResponse
        {
            ProviderId = request.ProviderId,
            Date = request.Date.Date,
            AvailableSlots = availableSlots.DistinctBy(s => s.StartTime).ToList(),
            BookedSlots = bookedSlots.DistinctBy(s => s.BookingId).ToList()
        });
    }
}
