using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Search.SearchServices;

public class SearchServicesHandler(ApplicationDbContext context)
    : IRequestHandler<SearchServicesQuery, Result<SearchServicesResponse>>
{
    private const double EarthRadiusKm = 6371;

    public async Task<Result<SearchServicesResponse>> Handle(SearchServicesQuery request, CancellationToken ct)
    {
        var query = context.Set<Service>()
            .Where(s => s.IsActive)
            .Include(s => s.Provider)
            .Where(s => s.Provider.IsActive && s.Provider.BusinessName != null)
            .AsQueryable();

        // Text search
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            var searchTerm = request.Query.ToLower();
            query = query.Where(s =>
                s.Name.ToLower().Contains(searchTerm) ||
                s.Description.ToLower().Contains(searchTerm) ||
                s.Category.ToLower().Contains(searchTerm) ||
                (s.Provider.BusinessName != null && s.Provider.BusinessName.ToLower().Contains(searchTerm)));
        }

        // Category filter
        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            query = query.Where(s => s.Category.ToLower() == request.Category.ToLower());
        }

        // Price filters
        if (request.MinPrice.HasValue)
        {
            query = query.Where(s => s.BasePrice >= request.MinPrice.Value);
        }

        if (request.MaxPrice.HasValue)
        {
            query = query.Where(s => s.BasePrice <= request.MaxPrice.Value);
        }

        // Price type filter
        if (!string.IsNullOrWhiteSpace(request.PriceType))
        {
            query = query.Where(s => s.PriceType.ToLower() == request.PriceType.ToLower());
        }

        // Rating filter
        if (request.MinRating.HasValue)
        {
            query = query.Where(s => s.Provider.Rating >= request.MinRating.Value);
        }

        // Get all matching services first for location filtering
        var servicesWithProviders = await query
            .Select(s => new
            {
                Service = s,
                s.Provider
            })
            .ToListAsync(ct);

        // Apply location filter in memory (Haversine calculation)
        var locationFilterActive = request.Latitude.HasValue &&
                                   request.Longitude.HasValue &&
                                   request.RadiusKm.HasValue;

        var filteredServices = servicesWithProviders
            .Select(sp => new
            {
                sp.Service,
                sp.Provider,
                Distance = locationFilterActive && sp.Provider.Latitude.HasValue && sp.Provider.Longitude.HasValue
                    ? CalculateHaversineDistance(
                        request.Latitude!.Value, request.Longitude!.Value,
                        sp.Provider.Latitude.Value, sp.Provider.Longitude.Value)
                    : (double?)null
            })
            .Where(sp => !locationFilterActive ||
                         (sp.Distance.HasValue && sp.Distance <= request.RadiusKm!.Value) ||
                         (sp.Provider.Latitude == null && sp.Provider.Longitude == null)) // Include providers without location
            .ToList();

        var totalCount = filteredServices.Count;

        // Sorting
        var sortedServices = request.SortBy.ToLower() switch
        {
            "price-low" => filteredServices.OrderBy(s => s.Service.BasePrice),
            "price-high" => filteredServices.OrderByDescending(s => s.Service.BasePrice),
            "rating" => filteredServices.OrderByDescending(s => s.Provider.Rating ?? 0),
            "distance" when locationFilterActive => filteredServices.OrderBy(s => s.Distance ?? double.MaxValue),
            "newest" => filteredServices.OrderByDescending(s => s.Service.CreatedAt),
            _ => filteredServices
                .OrderByDescending(s => s.Provider.Rating ?? 0)
                .ThenBy(s => s.Distance ?? double.MaxValue)
        };

        // Pagination
        var pagedServices = sortedServices
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(sp => new ServiceSearchResultDto
            {
                Id = sp.Service.Id,
                Name = sp.Service.Name,
                Description = sp.Service.Description,
                Category = sp.Service.Category,
                BasePrice = sp.Service.BasePrice,
                PriceType = sp.Service.PriceType,
                EstimatedDurationMinutes = sp.Service.EstimatedDurationMinutes,
                ProviderId = sp.Provider.Id,
                ProviderName = sp.Provider.FullName,
                BusinessName = sp.Provider.BusinessName,
                ProviderRating = sp.Provider.Rating,
                ProviderTotalReviews = sp.Provider.TotalReviews,
                ProviderCity = sp.Provider.City,
                ProviderProfilePicture = sp.Provider.ProfilePictureUrl,
                DistanceKm = sp.Distance.HasValue ? Math.Round(sp.Distance.Value, 1) : null
            })
            .ToList();

        return Result<SearchServicesResponse>.Success(new SearchServicesResponse
        {
            Services = pagedServices,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize),
            CurrentPage = request.Page,
            FiltersApplied = new SearchFiltersApplied
            {
                Query = request.Query,
                Category = request.Category,
                MinPrice = request.MinPrice,
                MaxPrice = request.MaxPrice,
                MinRating = request.MinRating,
                RadiusKm = request.RadiusKm,
                LocationFilterActive = locationFilterActive
            }
        });
    }

    private static double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var dLat = DegreesToRadians(lat2 - lat1);
        var dLon = DegreesToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return EarthRadiusKm * c;
    }

    private static double DegreesToRadians(double degrees) => degrees * Math.PI / 180;
}