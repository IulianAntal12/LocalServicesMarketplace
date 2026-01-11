using FluentValidation;

namespace LocalServicesMarketplace.Api.Features.Bookings.CreateBooking;

public class CreateBookingValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingValidator()
    {
        RuleFor(x => x.ProviderId)
            .NotEmpty().WithMessage("Provider is required");

        RuleFor(x => x.ServiceId)
            .GreaterThan(0).WithMessage("Service is required");

        RuleFor(x => x.ScheduledDate)
            .GreaterThan(DateTime.UtcNow.Date)
            .WithMessage("Scheduled date must be in the future");

        RuleFor(x => x.Address)
            .MaximumLength(200).WithMessage("Address cannot exceed 200 characters");

        RuleFor(x => x.City)
            .MaximumLength(50).WithMessage("City cannot exceed 50 characters");

        RuleFor(x => x.CustomerNotes)
            .MaximumLength(1000).WithMessage("Notes cannot exceed 1000 characters");
    }
}
