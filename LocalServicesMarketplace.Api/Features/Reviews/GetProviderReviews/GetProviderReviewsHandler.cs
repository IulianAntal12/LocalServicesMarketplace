using LocalServicesMarketplace.Api.Features.SharedDTOs;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Reviews.GetProviderReviews;

public class GetProviderReviewsHandler(ApplicationDbContext context)
    : IRequestHandler<GetProviderReviewsQuery, Result<GetProviderReviewsResponse>>
{
    public async Task<Result<GetProviderReviewsResponse>> Handle(GetProviderReviewsQuery request, CancellationToken ct)
    {
        var providerExists = await context.Users
            .AnyAsync(u => u.Id == request.ProviderId, ct);

        if (!providerExists)
            return Result<GetProviderReviewsResponse>.NotFound("Provider not found!");

        var query = context.Set<Review>()
            .Where(r => r.ProviderId == request.ProviderId && r.IsVisible)
            .Include(r => r.Customer)
            .Include(r => r.Service)
            .AsQueryable();

        var totalCount = await query.CountAsync(ct);

        var sortedQuery = request.SortBy.ToLower() switch
        {
            "rating-high" => query.OrderByDescending(r => r.Rating).ThenByDescending(r => r.CreatedAt),
            "rating-low" => query.OrderBy(r => r.Rating).ThenByDescending(r => r.CreatedAt),
            _ => query.OrderByDescending(r => r.CreatedAt)
        };

        var reviews = await sortedQuery
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                CustomerId = r.CustomerId,
                CustomerName = r.Customer.FullName,
                ProviderId = r.ProviderId,
                ServiceId = r.ServiceId,
                ServiceName = r.Service != null ? r.Service.Name : null,
                Rating = r.Rating,
                Title = r.Title,
                Comment = r.Comment,
                ProviderResponse = r.ProviderResponse,
                ProviderResponseAt = r.ProviderResponseAt,
                CreatedAt = r.CreatedAt,
                IsVerified = r.IsVerified
            })
            .ToListAsync(ct);

        var ratingDistribution = await context.Set<Review>()
            .Where(r => r.ProviderId == request.ProviderId && r.IsVisible)
            .GroupBy(r => r.Rating)
            .Select(g => new { Rating = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Rating, x => x.Count, ct);

        var averageRating = totalCount > 0
            ? await context.Set<Review>()
                .Where(r => r.ProviderId == request.ProviderId && r.IsVisible)
                .AverageAsync(r => r.Rating, ct)
            : 0;

        return Result<GetProviderReviewsResponse>.Success(new GetProviderReviewsResponse
        {
            Reviews = reviews,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize),
            AverageRating = Math.Round(averageRating, 1),
            RatingDistribution = ratingDistribution
        });
    }
}