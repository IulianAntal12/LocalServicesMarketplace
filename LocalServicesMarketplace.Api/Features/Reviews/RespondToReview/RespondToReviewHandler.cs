using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Constants;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Reviews.RespondToReview;

public class RespondToReviewHandler(ApplicationDbContext context, ICurrentUserService currentUser)
    : IRequestHandler<RespondToReviewCommand, Result<RespondToReviewResponse>>
{
    public async Task<Result<RespondToReviewResponse>> Handle(RespondToReviewCommand request, CancellationToken ct)
    {
        if (!currentUser.IsInRole(Roles.Provider))
            return Result<RespondToReviewResponse>.Forbidden("Only providers can respond to reviews!");

        if (string.IsNullOrWhiteSpace(request.Response) || request.Response.Length > 500)
            return Result<RespondToReviewResponse>.BadRequest("Response must be between 1 and 500 characters!");

        var review = await context.Set<Review>()
            .FirstOrDefaultAsync(r => r.Id == request.ReviewId && r.ProviderId == currentUser.UserId, ct);

        if (review == null)
            return Result<RespondToReviewResponse>.NotFound("Review not found or you don't have permission to respond!");

        if (!string.IsNullOrEmpty(review.ProviderResponse))
            return Result<RespondToReviewResponse>.Conflict("You have already responded to this review!");

        review.ProviderResponse = request.Response;
        review.ProviderResponseAt = DateTime.UtcNow;

        await context.SaveChangesAsync(ct);

        return Result<RespondToReviewResponse>.Success(
            new RespondToReviewResponse { Message = "Response added successfully!" });
    }
}