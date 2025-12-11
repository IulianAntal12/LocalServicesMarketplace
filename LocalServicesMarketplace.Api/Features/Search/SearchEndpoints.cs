using LocalServicesMarketplace.Api.Endpoints;
using LocalServicesMarketplace.Api.Extensions;
using LocalServicesMarketplace.Api.Features.Search.GetCategories;
using LocalServicesMarketplace.Api.Features.Search.GetSearchSuggestions;
using LocalServicesMarketplace.Api.Features.Search.SearchProviders;
using LocalServicesMarketplace.Api.Features.Search.SearchServices;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LocalServicesMarketplace.Api.Features.Search;

public class SearchEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/search")
            .WithTags("Search")
            .AllowAnonymous();

        group.MapGet("/services", SearchServicesAsync)
            .WithName("SearchServices")
            .WithSummary("Search services with filters and location")
            .Produces<SearchServicesResponse>();

        group.MapGet("/providers", SearchProvidersAsync)
            .WithName("SearchProviders")
            .WithSummary("Search providers with filters and location")
            .Produces<SearchProvidersResponse>();

        group.MapGet("/categories", GetCategoriesAsync)
            .WithName("GetCategories")
            .WithSummary("Get all service categories")
            .Produces<List<CategoryDto>>();

        group.MapGet("/suggestions", GetSearchSuggestionsAsync)
            .WithName("GetSearchSuggestions")
            .WithSummary("Get search suggestions based on query")
            .Produces<SearchSuggestionsResponse>();
    }

    private static async Task<IResult> SearchServicesAsync(
        [FromQuery] string? q,
        [FromQuery] string? category,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? priceType,
        [FromQuery] double? lat,
        [FromQuery] double? lng,
        [FromQuery] int? radius,
        [FromQuery] double? minRating,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sortBy,
        IMediator mediator,
        CancellationToken ct)
    {
        var query = new SearchServicesQuery
        {
            Query = q,
            Category = category,
            MinPrice = minPrice,
            MaxPrice = maxPrice,
            PriceType = priceType,
            Latitude = lat,
            Longitude = lng,
            RadiusKm = radius,
            MinRating = minRating,
            Page = page > 0 ? page.Value : 1,
            PageSize = pageSize > 0 && pageSize <= 50 ? pageSize.Value : 20,
            SortBy = sortBy ?? "relevance"
        };

        var result = await mediator.Send(query, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> SearchProvidersAsync(
        [FromQuery] string? q,
        [FromQuery] string? category,
        [FromQuery] string? city,
        [FromQuery] string? serviceArea,
        [FromQuery] double? lat,
        [FromQuery] double? lng,
        [FromQuery] int? radius,
        [FromQuery] double? minRating,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sortBy,
        IMediator mediator,
        CancellationToken ct)
    {
        var query = new SearchProvidersQuery
        {
            Query = q,
            Category = category,
            City = city,
            ServiceArea = serviceArea,
            Latitude = lat,
            Longitude = lng,
            RadiusKm = radius,
            MinRating = minRating,
            Page = page > 0 ? page.Value : 1,
            PageSize = pageSize > 0 && pageSize <= 50 ? pageSize.Value : 20,
            SortBy = sortBy ?? "rating"
        };

        var result = await mediator.Send(query, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> GetCategoriesAsync(
        [FromQuery] bool? activeOnly,
        IMediator mediator,
        CancellationToken ct)
    {
        var query = new GetCategoriesQuery
        {
            ActiveOnly = activeOnly ?? true
        };

        var result = await mediator.Send(query, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> GetSearchSuggestionsAsync(
        [FromQuery] string? q,
        [FromQuery] int? limit,
        IMediator mediator,
        CancellationToken ct)
    {
        var query = new GetSearchSuggestionsQuery
        {
            Query = q ?? "",
            Limit = limit > 0 && limit <= 10 ? limit.Value : 5
        };

        var result = await mediator.Send(query, ct);
        return result.ToApiResponse();
    }
}