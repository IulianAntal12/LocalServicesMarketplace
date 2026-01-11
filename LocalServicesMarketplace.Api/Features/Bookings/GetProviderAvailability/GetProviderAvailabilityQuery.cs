using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Bookings.GetProviderAvailability;

public class GetProviderAvailabilityQuery : IRequest<Result<ProviderAvailabilityResponse>>
{
    public required string ProviderId { get; set; }
    public DateTime Date { get; set; }
}

public class ProviderAvailabilityResponse
{
    public required string ProviderId { get; set; }
    public DateTime Date { get; set; }
    public List<TimeSlot> AvailableSlots { get; set; } = [];
    public List<TimeSlot> BookedSlots { get; set; } = [];
}

public class TimeSlot
{
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsAvailable { get; set; }
    public int? BookingId { get; set; } // Only for booked slots
}
