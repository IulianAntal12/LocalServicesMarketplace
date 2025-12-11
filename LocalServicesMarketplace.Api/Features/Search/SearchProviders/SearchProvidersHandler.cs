using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Search.SearchProviders;

public class SearchProvidersHandler(ApplicationDbContext context)
    : IRequestHandler<SearchProvidersQuery, Result<SearchProvidersResponse>>
{
    private const double EarthRadiusKm = 6371;

    public async Task<Result<SearchProvidersResponse>> Handle(SearchProvidersQuery request, CancellationToken ct)
    {
        var query = context.Users
            .Where(u => u.IsActive && u.BusinessName != null)
            .Include(u => u.Services.Where(s => s.IsActive))
            .Include(u => u.PortfolioImages)
            .AsQueryable();

        // Text search
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            var searchTerm = request.Query.ToLower();
            query = query.Where(u =>
                (u.BusinessName != null && u.BusinessName.ToLower().Contains(searchTerm)) ||
                (u.BusinessDescription != null && u.BusinessDescription.ToLower().Contains(searchTerm)) ||
                u.FirstName.ToLower().Contains(searchTerm) ||
                u.LastName.ToLower().Contains(searchTerm) ||
                u.Services.Any(s => s.Name.ToLower().Contains(searchTerm)));
        }

        // Category filter - providers who offer services in this category
        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            query = query.Where(u => u.Services.Any(s => s.Category.ToLower() == request.Category.ToLower() && s.IsActive));
        }

        // City filter
        if (!string.IsNullOrWhiteSpace(request.City))
        {
            query = query.Where(u => u.City != null && u.City.ToLower().Contains(request.City.ToLower()));
        }

        // Service area filter
        if (!string.IsNullOrWhiteSpace(request.ServiceArea))
        {
            query = query.Where(u => u.ServiceAreas.Any(sa => sa.ToLower().Contains(request.ServiceArea.ToLower())));
        }

        // Rating filter
        if (request.MinRating.HasValue)
        {
            query = query.Where(u => u.Rating >= request.MinRating.Value);
        }

        var providers = await query.ToListAsync(ct);

        // Apply location filter in memory
        var locationFilterActive = request.Latitude.HasValue &&
                                   request.Longitude.HasValue &&
                                   request.RadiusKm.HasValue;

        var providersWithDistance = providers
            .Select(p => new
            {
                Provider = p,
                Distance = locationFilterActive && p.Latitude.HasValue && p.Longitude.HasValue
                    ? CalculateHaversineDistance(
                        request.Latitude!.Value, request.Longitude!.Value,
                        p.Latitude.Value, p.Longitude.Value)
                    : (double?)null,
                Categories = p.Services.Select(s => s.Category).Distinct().ToList()
            })
            .Where(p => !locationFilterActive ||
                        (p.Distance.HasValue && p.Distance <= request.RadiusKm!.Value) ||
                        (p.Provider.Latitude == null && p.Provider.Longitude == null))
            .ToList();

        var totalCount = providersWithDistance.Count;

        // Sorting
        var sortedProviders = request.SortBy.ToLower() switch
        {
            "distance" when locationFilterActive => providersWithDistance.OrderBy(p => p.Distance ?? double.MaxValue),
            "reviews" => providersWithDistance.OrderByDescending(p => p.Provider.TotalReviews),
            "newest" => providersWithDistance.OrderByDescending(p => p.Provider.CreatedAt),
            "price-low" => providersWithDistance.OrderBy(p => p.Provider.HourlyRate ?? decimal.MaxValue),
            "price-high" => providersWithDistance.OrderByDescending(p => p.Provider.HourlyRate ?? 0),
            _ => providersWithDistance.OrderByDescending(p => p.Provider.Rating ?? 0)
                .ThenByDescending(p => p.Provider.TotalReviews)
        };

        // Pagination
        var pagedProviders = sortedProviders
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ProviderSearchResultDto
            {
                Id = p.Provider.Id,
                FullName = p.Provider.FullName,
                BusinessName = p.Provider.BusinessName!,
                BusinessDescription = p.Provider.BusinessDescription,
                Rating = p.Provider.Rating,
                TotalReviews = p.Provider.TotalReviews,
                HourlyRate = p.Provider.HourlyRate,
                City = p.Provider.City,
                ServiceAreas = p.Provider.ServiceAreas,
                ProfilePictureUrl = p.Provider.ProfilePictureUrl,
                ServiceCount = p.Provider.Services.Count,
                PortfolioImageCount = p.Provider.PortfolioImages.Count,
                Categories = p.Categories,
                DistanceKm = p.Distance.HasValue ? Math.Round(p.Distance.Value, 1) : null,
                MemberSince = p.Provider.CreatedAt
            })
            .ToList();

        return Result<SearchProvidersResponse>.Success(new SearchProvidersResponse
        {
            Providers = pagedProviders,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize),
            CurrentPage = request.Page
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