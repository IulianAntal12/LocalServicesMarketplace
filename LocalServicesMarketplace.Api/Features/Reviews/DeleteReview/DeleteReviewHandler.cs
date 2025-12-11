using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Constants;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace LocalServicesMarketplace.Api.Features.Reviews.DeleteReview;

public class DeleteReviewHandler(ApplicationDbContext context, ICurrentUserService currentUser)
    : IRequestHandler<DeleteReviewCommand, Result>
{
    public async Task<Result> Handle(DeleteReviewCommand request, CancellationToken ct)
    {
        var review = await context.Set<Review>()
            .FirstOrDefaultAsync(r => r.Id == request.ReviewId, ct);

        if (review == null)
            return Result.NotFound("Review not found!");

        var canDelete = review.CustomerId == currentUser.UserId ||
                        currentUser.IsInRole(Roles.Admin) ||
                        currentUser.IsInRole(Roles.Moderator);

        if (!canDelete)
            return Result.Forbidden("You don't have permission to delete this review!");

        var providerId = review.ProviderId;

        context.Set<Review>().Remove(review);
        await context.SaveChangesAsync(ct);

        await UpdateProviderRatingAsync(providerId, ct);

        return Result.Success(HttpStatusCode.NoContent);
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

        var provider = await context.Users.FindAsync([providerId], ct);
        if (provider != null)
        {
            if (stats != null)
            {
                provider.Rating = Math.Round(stats.AverageRating, 1);
                provider.TotalReviews = stats.TotalReviews;
            }
            else
            {
                provider.Rating = null;
                provider.TotalReviews = 0;
            }
            await context.SaveChangesAsync(ct);
        }
    }
}