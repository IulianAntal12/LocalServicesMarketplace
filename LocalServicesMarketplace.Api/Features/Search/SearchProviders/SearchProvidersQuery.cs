using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Search.SearchProviders;

public class SearchProvidersQuery : IRequest<Result<SearchProvidersResponse>>
{
    // Text search
    public string? Query { get; set; }

    // Filters
    public string? Category { get; set; }
    public string? City { get; set; }
    public string? ServiceArea { get; set; }

    // Location-based
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int? RadiusKm { get; set; }

    // Rating filter
    public double? MinRating { get; set; }

    // Pagination & sorting
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string SortBy { get; set; } = "rating"; // rating, distance, reviews, newest, price-low, price-high
}

public class SearchProvidersResponse
{
    public List<ProviderSearchResultDto> Providers { get; set; } = [];
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
}

public class ProviderSearchResultDto
{
    public required string Id { get; set; }
    public required string FullName { get; set; }
    public required string BusinessName { get; set; }
    public string? BusinessDescription { get; set; }
    public double? Rating { get; set; }
    public int TotalReviews { get; set; }
    public decimal? HourlyRate { get; set; }
    public string? City { get; set; }
    public List<string> ServiceAreas { get; set; } = [];
    public string? ProfilePictureUrl { get; set; }
    public int ServiceCount { get; set; }
    public int PortfolioImageCount { get; set; }
    public List<string> Categories { get; set; } = [];
    public double? DistanceKm { get; set; }
    public DateTime MemberSince { get; set; }
}