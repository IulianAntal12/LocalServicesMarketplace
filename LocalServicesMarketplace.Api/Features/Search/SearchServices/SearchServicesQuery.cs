using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Search.SearchServices;

public class SearchServicesQuery : IRequest<Result<SearchServicesResponse>>
{
    // Text search
    public string? Query { get; set; }

    // Filters
    public string? Category { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? PriceType { get; set; } // Hourly, Fixed, Quote

    // Location-based
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int? RadiusKm { get; set; } // Search radius in kilometers

    // Provider filters
    public double? MinRating { get; set; }

    // Pagination & sorting
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string SortBy { get; set; } = "relevance"; // relevance, price-low, price-high, rating, distance, newest
}

public class SearchServicesResponse
{
    public List<ServiceSearchResultDto> Services { get; set; } = [];
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
    public SearchFiltersApplied FiltersApplied { get; set; } = new();
}

public class ServiceSearchResultDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string Category { get; set; }
    public decimal BasePrice { get; set; }
    public string PriceType { get; set; } = "Hourly";
    public int EstimatedDurationMinutes { get; set; }

    // Provider info
    public required string ProviderId { get; set; }
    public required string ProviderName { get; set; }
    public string? BusinessName { get; set; }
    public double? ProviderRating { get; set; }
    public int ProviderTotalReviews { get; set; }
    public string? ProviderCity { get; set; }
    public string? ProviderProfilePicture { get; set; }

    // Distance (if location provided)
    public double? DistanceKm { get; set; }
}

public class SearchFiltersApplied
{
    public string? Query { get; set; }
    public string? Category { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public double? MinRating { get; set; }
    public int? RadiusKm { get; set; }
    public bool LocationFilterActive { get; set; }
}