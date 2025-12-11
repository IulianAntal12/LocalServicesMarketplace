using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Search.GetCategories;

public class GetCategoriesHandler(ApplicationDbContext context)
    : IRequestHandler<GetCategoriesQuery, Result<List<CategoryDto>>>
{
    public async Task<Result<List<CategoryDto>>> Handle(GetCategoriesQuery request, CancellationToken ct)
    {
        var categoriesQuery = context.Set<ServiceCategory>().AsQueryable();

        if (request.ActiveOnly)
        {
            categoriesQuery = categoriesQuery.Where(c => c.IsActive);
        }

        var categories = await categoriesQuery
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync(ct);

        // Get service counts per category
        var serviceCounts = await context.Set<Service>()
            .Where(s => s.IsActive)
            .GroupBy(s => s.Category)
            .Select(g => new { Category = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Category.ToLower(), x => x.Count, ct);

        // Get provider counts per category
        var providerCounts = await context.Set<Service>()
            .Where(s => s.IsActive && s.Provider.IsActive)
            .GroupBy(s => s.Category)
            .Select(g => new { Category = g.Key, Count = g.Select(s => s.ProviderId).Distinct().Count() })
            .ToDictionaryAsync(x => x.Category.ToLower(), x => x.Count, ct);

        var result = categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            Icon = c.Icon,
            ServiceCount = serviceCounts.GetValueOrDefault(c.Name.ToLower(), 0),
            ProviderCount = providerCounts.GetValueOrDefault(c.Name.ToLower(), 0)
        }).ToList();

        return Result<List<CategoryDto>>.Success(result);
    }
}