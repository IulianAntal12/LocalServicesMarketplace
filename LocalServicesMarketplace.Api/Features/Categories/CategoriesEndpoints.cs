using LocalServicesMarketplace.Api.Endpoints;
using LocalServicesMarketplace.Api.Features.Search.GetCategories;
using LocalServicesMarketplace.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Categories;

public class CategoriesEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/categories")
            .WithTags("Categories");

        group.MapGet("/", GetAllCategoriesAsync)
            .AllowAnonymous()
            .WithName("GetAllCategories")
            .WithSummary("Get all active service categories")
            .Produces<List<CategoryDto>>();
    }

    private static async Task<IResult> GetAllCategoriesAsync(
        ApplicationDbContext context,
        CancellationToken ct)
    {
        var categories = await context.ServiceCategories
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Icon = c.Icon
            })
            .ToListAsync(ct);

        return Results.Ok(categories);
    }
}
