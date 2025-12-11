using FluentValidation;
using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Constants;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace LocalServicesMarketplace.Api.Features.Reviews.CreateReview;

public class CreateReviewHandler(ApplicationDbContext context, ICurrentUserService currentUser, IValidator<CreateReviewCommand> validator)
    : IRequestHandler<CreateReviewCommand, Result<CreateReviewResponse>>
{
    public async Task<Result<CreateReviewResponse>> Handle(CreateReviewCommand request, CancellationToken ct)
    {
        if (!currentUser.IsInRole(Roles.Customer))
            return Result<CreateReviewResponse>.Forbidden("Only customers can write reviews!");

        var validationResult = await validator.ValidateAsync(request, ct);
        if (!validationResult.IsValid)
            return Result<CreateReviewResponse>.ValidationFailure(
                [.. validationResult.Errors.Select(e => e.ErrorMessage)]);

        var providerExists = await context.Users
            .AnyAsync(u => u.Id == request.ProviderId && u.IsActive && u.BusinessName != null, ct);

        if (!providerExists)
            return Result<CreateReviewResponse>.NotFound("Provider not found!");

        var alreadyReviewed = await context.Set<Review>()
            .AnyAsync(r => r.CustomerId == currentUser.UserId && r.ProviderId == request.ProviderId, ct);

        if (alreadyReviewed)
            return Result<CreateReviewResponse>.Conflict("You have already reviewed this provider!");

        if (request.ServiceId.HasValue)
        {
            var serviceExists = await context.Set<Service>()
                .AnyAsync(s => s.Id == request.ServiceId && s.ProviderId == request.ProviderId, ct);

            if (!serviceExists)
                return Result<CreateReviewResponse>.BadRequest("Service does not belong to this provider!");
        }

        var review = new Review
        {
            CustomerId = currentUser.UserId!,
            ProviderId = request.ProviderId,
            ServiceId = request.ServiceId,
            Rating = request.Rating,
            Title = request.Title,
            Comment = request.Comment,
            IsVerified = false
        };

        context.Set<Review>().Add(review);
        await context.SaveChangesAsync(ct);

        await UpdateProviderRatingAsync(request.ProviderId, ct);

        return Result<CreateReviewResponse>.Success(
            new CreateReviewResponse
            {
                ReviewId = review.Id,
                Message = "Review submitted successfully!"
            },
            HttpStatusCode.Created);
    }

    private async Task UpdateProviderRatingAsync(string providerId, CancellationToken ct)
    {
        var stats = await context.Set<Review>()
            .Where(r => r.ProviderId == providerId && r.IsVisible)
            .GroupBy(r => r.ProviderId)
            .Select(g => new
            {
                AverageRating = g.Average(r => r.Rating),
                TotalReviews = g.Count()
            })
            .FirstOrDefaultAsync(ct);

        if (stats != null)
        {
            var provider = await context.Users.FindAsync([providerId], ct);
            if (provider != null)
            {
                provider.Rating = Math.Round(stats.AverageRating, 1);
                provider.TotalReviews = stats.TotalReviews;
                await context.SaveChangesAsync(ct);
            }
        }
    }
}