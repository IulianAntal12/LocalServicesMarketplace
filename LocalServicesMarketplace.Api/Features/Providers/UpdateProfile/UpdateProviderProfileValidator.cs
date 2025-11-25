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
    }
}