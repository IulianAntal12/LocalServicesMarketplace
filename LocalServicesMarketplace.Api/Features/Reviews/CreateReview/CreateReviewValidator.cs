using FluentValidation;

namespace LocalServicesMarketplace.Api.Features.Reviews.CreateReview;

public class CreateReviewValidator : AbstractValidator<CreateReviewCommand>
{
    public CreateReviewValidator()
    {
        RuleFor(x => x.ProviderId)
            .NotEmpty().WithMessage("Provider ID is required!");

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5 stars!");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Review title is required!")
            .MaximumLength(100).WithMessage("Title cannot exceed 100 characters!");

        RuleFor(x => x.Comment)
            .NotEmpty().WithMessage("Review comment is required!")
            .MinimumLength(10).WithMessage("Comment must be at least 10 characters!")
            .MaximumLength(1000).WithMessage("Comment cannot exceed 1000 characters!");
    }
}