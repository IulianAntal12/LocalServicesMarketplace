using LocalServicesMarketplace.Api.Features.SharedDTOs;
using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Reviews.GetProviderReviews;

public class GetProviderReviewsQuery : IRequest<Result<GetProviderReviewsResponse>>
{
    public required string ProviderId { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string SortBy { get; set; } = "recent"; // recent, rating-high, rating-low, helpful
}

public class GetProviderReviewsResponse
{
    public List<ReviewDto> Reviews { get; set; } = [];
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public double AverageRating { get; set; }
    public Dictionary<int, int> RatingDistribution { get; set; } = [];
}