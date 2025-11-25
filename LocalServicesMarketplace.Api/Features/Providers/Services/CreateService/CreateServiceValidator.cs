using FluentValidation;

namespace LocalServicesMarketplace.Api.Features.Providers.Services.CreateService;

public class CreateServiceValidator : AbstractValidator<CreateServiceCommand>
{
    private readonly string[] _validPriceTypes = ["Hourly", "Fixed", "Quote"];

    public CreateServiceValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Service name is required!")
            .MaximumLength(100).WithMessage("Service name cannot exceed 100 characters!");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Service description is required!")
            .MaximumLength(500).WithMessage("Service description cannot exceed 500 characters!");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required!")
            .MaximumLength(50);

        RuleFor(x => x.BasePrice)
            .GreaterThanOrEqualTo(0).WithMessage("Price must be positive!")
            .LessThan(10000).WithMessage("Price seems too high!");

        RuleFor(x => x.PriceType)
            .Must(x => _validPriceTypes.Contains(x))
            .WithMessage("Price type must be Hourly, Fixed, or Quote!");

        RuleFor(x => x.EstimatedDurationMinutes)
            .GreaterThan(0)
            .LessThanOrEqualTo(480)
            .WithMessage("Duration must be between 1 and 480 minutes!");
    }
}