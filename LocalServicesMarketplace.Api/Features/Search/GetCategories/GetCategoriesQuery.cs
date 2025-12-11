using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Search.GetCategories;

public class GetCategoriesQuery : IRequest<Result<List<CategoryDto>>>
{
    public bool ActiveOnly { get; set; } = true;
}

public class CategoryDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public int ProviderCount { get; set; }
    public int ServiceCount { get; set; }
}