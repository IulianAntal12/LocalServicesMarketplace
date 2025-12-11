using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Constants;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Reviews.UpdateReview;

public class UpdateReviewHandler(ApplicationDbContext context, ICurrentUserService currentUser)
    : IRequestHandler<UpdateReviewCommand, Result<UpdateReviewResponse>>
{
    public async Task<Result<UpdateReviewResponse>> Handle(UpdateReviewCommand request, CancellationToken ct)
    {
        if (!currentUser.IsInRole(Roles.Customer))
            return Result<UpdateReviewResponse>.Forbidden("Only customers can update reviews!");

        var review = await context.Set<Review>()
            .FirstOrDefaultAsync(r => r.Id == request.ReviewId && r.CustomerId == currentUser.UserId, ct);

        if (review == null)
            return Result<UpdateReviewResponse>.NotFound("Review not found or you don't have permission to edit it!");

        var originalRating = review.Rating;

        if (request.Rating.HasValue)
        {
            if (request.Rating < 1 || request.Rating > 5)
                return Result<UpdateReviewResponse>.BadRequest("Rating must be between 1 and 5!");
            review.Rating = request.Rating.Value;
        }

        if (!string.IsNullOrEmpty(request.Title))
        {
            if (request.Title.Length > 100)
                return Result<UpdateReviewResponse>.BadRequest("Title cannot exceed 100 characters!");
            review.Title = request.Title;
        }

        if (!string.IsNullOrEmpty(request.Comment))
        {
            if (request.Comment.Length < 10 || request.Comment.Length > 1000)
                return Result<UpdateReviewResponse>.BadRequest("Comment must be between 10 and 1000 characters!");
            review.Comment = request.Comment;
        }

        review.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(ct);

        if (request.Rating.HasValue && request.Rating != originalRating)
        {
            await UpdateProviderRatingAsync(review.ProviderId, ct);
        }

        return Result<UpdateReviewResponse>.Success(
            new UpdateReviewResponse { Message = "Review updated successfully!" });
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