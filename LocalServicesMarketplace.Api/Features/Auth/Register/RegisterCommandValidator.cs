using FluentValidation;
using LocalServicesMarketplace.Core.Constants;

namespace LocalServicesMarketplace.Api.Features.Auth.Register;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required!")
            .EmailAddress().WithMessage("Invalid email format.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required!")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
            .Matches(@"[A-Z]").WithMessage("Password must contain uppercase letter.")
            .Matches(@"[a-z]").WithMessage("Password must contain lowercase letter.")
            .Matches(@"[0-9]").WithMessage("Password must contain number.")
            .Matches(@"[!@#$%^&*(),.?"":{}|<>]").WithMessage("Password must contain special character.");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required!")
            .MaximumLength(50).WithMessage("First name cannot exceed 50 characters.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required!")
            .MaximumLength(50).WithMessage("Last name cannot exceed 50 characters.");

        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("Role is required!")
            .Must(BeValidRole).WithMessage($"Role must be {Roles.Customer} or {Roles.Provider}");

        When(x => x.Role == Roles.Provider, () =>
        {
            RuleFor(x => x.BusinessName)
                .NotEmpty().WithMessage("Business name is required for providers!")
                .MaximumLength(100).WithMessage("Business name cannot exceed 100 characters.");

            RuleFor(x => x.BusinessDescription)
                .NotEmpty().WithMessage("Business description is required for providers!")
                .MaximumLength(500).WithMessage("Business description cannot exceed 500 characters.");
        });
    }

    private bool BeValidRole(string role) => role == Roles.Customer || role == Roles.Provider;
}