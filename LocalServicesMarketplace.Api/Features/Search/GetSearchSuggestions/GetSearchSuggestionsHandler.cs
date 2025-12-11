using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Search.GetSearchSuggestions;

public class GetSearchSuggestionsHandler(ApplicationDbContext context)
    : IRequestHandler<GetSearchSuggestionsQuery, Result<SearchSuggestionsResponse>>
{
    public async Task<Result<SearchSuggestionsResponse>> Handle(GetSearchSuggestionsQuery request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Query) || request.Query.Length < 2)
        {
            return Result<SearchSuggestionsResponse>.Success(new SearchSuggestionsResponse());
        }

        var searchTerm = request.Query.ToLower();

        // Service name suggestions
        var serviceSuggestions = await context.Set<Service>()
            .Where(s => s.IsActive && s.Name.ToLower().Contains(searchTerm))
            .Select(s => s.Name)
            .Distinct()
            .Take(request.Limit)
            .ToListAsync(ct);

        // Provider/Business name suggestions
        var providerSuggestions = await context.Users
            .Where(u => u.IsActive && u.BusinessName != null &&
                        u.BusinessName.ToLower().Contains(searchTerm))
            .Select(u => u.BusinessName!)
            .Distinct()
            .Take(request.Limit)
            .ToListAsync(ct);

        // Category suggestions
        var categorySuggestions = await context.Set<ServiceCategory>()
            .Where(c => c.IsActive && c.Name.ToLower().Contains(searchTerm))
            .Select(c => c.Name)
            .Take(request.Limit)
            .ToListAsync(ct);

        return Result<SearchSuggestionsResponse>.Success(new SearchSuggestionsResponse
        {
            Services = serviceSuggestions,
            Providers = providerSuggestions,
            Categories = categorySuggestions
        });
    }
}