using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Reviews.UpdateReview;

public class UpdateReviewCommand : IRequest<Result<UpdateReviewResponse>>
{
    public int ReviewId { get; set; }
    public int? Rating { get; set; }
    public string? Title { get; set; }
    public string? Comment { get; set; }
}

public class UpdateReviewResponse
{
    public required string Message { get; set; }
}