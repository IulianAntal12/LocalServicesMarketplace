using FluentValidation;

namespace LocalServicesMarketplace.Api.Features.Bookings.CancelBooking;

public class CancelBookingValidator : AbstractValidator<CancelBookingCommand>
{
    public CancelBookingValidator()
    {
        RuleFor(x => x.BookingId)
            .GreaterThan(0).WithMessage("Invalid booking ID");

        RuleFor(x => x.CancellationReason)
            .MaximumLength(500).WithMessage("Cancellation reason cannot exceed 500 characters");
    }
}
