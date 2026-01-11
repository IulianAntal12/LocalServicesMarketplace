using FluentValidation;

namespace LocalServicesMarketplace.Api.Features.Bookings.UpdateBookingStatus;

public class UpdateBookingStatusValidator : AbstractValidator<UpdateBookingStatusCommand>
{
    private static readonly string[] AllowedStatuses = ["Confirmed", "InProgress", "Completed", "Rejected", "NoShow"];

    public UpdateBookingStatusValidator()
    {
        RuleFor(x => x.BookingId)
            .GreaterThan(0).WithMessage("Invalid booking ID");

        RuleFor(x => x.NewStatus)
            .NotEmpty().WithMessage("Status is required")
            .Must(s => AllowedStatuses.Contains(s, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of: {string.Join(", ", AllowedStatuses)}");

        RuleFor(x => x.ProviderNotes)
            .MaximumLength(1000).WithMessage("Notes cannot exceed 1000 characters");

        RuleFor(x => x.FinalPrice)
            .GreaterThanOrEqualTo(0).When(x => x.FinalPrice.HasValue)
            .WithMessage("Final price cannot be negative");
    }
}
