using FluentValidation;

namespace LocalServicesMarketplace.Api.Features.Providers.UpdateProfile;

public class UpdateProviderProfileValidator : AbstractValidator<UpdateProviderProfileCommand>
{
    public UpdateProviderProfileValidator()
    {
        RuleFor(x => x.BusinessName)
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.BusinessName));

        RuleFor(x => x.BusinessDescription)
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.BusinessDescription));

        RuleFor(x => x.HourlyRate)
            .GreaterThan(0)
            .LessThan(1000)
            .When(x => x.HourlyRate.HasValue);

        RuleFor(x => x.ServiceAreas)
            .Must(x => x == null || x.Count <= 10)
            .WithMessage("Maximum 10 service areas allowed.");

        RuleFor(x => x.City)
            .MaximumLength(50)
            .When(x => !string.IsNullOrEmpty(x.City));

        RuleFor(x => x.PostalCode)
            .MaximumLength(20)
            .When(x => !string.IsNullOrEmpty(x.PostalCode));

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90)
            .When(x => x.Latitude.HasValue)
            .WithMessage("Latitude must be between -90 and 90!");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180)
            .When(x => x.Longitude.HasValue)
            .WithMessage("Longitude must be between -180 and 180!");

        RuleFor(x => x.ServiceRadiusKm)
            .InclusiveBetween(1, 100)
            .When(x => x.ServiceRadiusKm.HasValue)
            .WithMessage("Service radius must be between 1 and 100 km!");
    }
}