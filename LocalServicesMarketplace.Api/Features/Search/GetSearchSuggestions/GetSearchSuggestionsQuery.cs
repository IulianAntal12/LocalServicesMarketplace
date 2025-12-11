using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Search.GetSearchSuggestions;

public class GetSearchSuggestionsQuery : IRequest<Result<SearchSuggestionsResponse>>
{
    public string Query { get; set; } = "";
    public int Limit { get; set; } = 5;
}

public class SearchSuggestionsResponse
{
    public List<string> Services { get; set; } = [];
    public List<string> Providers { get; set; } = [];
    public List<string> Categories { get; set; } = [];
}