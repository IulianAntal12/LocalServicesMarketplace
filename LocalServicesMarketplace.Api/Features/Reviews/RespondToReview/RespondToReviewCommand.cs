using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Reviews.RespondToReview;

public class RespondToReviewCommand : IRequest<Result<RespondToReviewResponse>>
{
    public int ReviewId { get; set; }
    public required string Response { get; set; }
}

public class RespondToReviewResponse
{
    public required string Message { get; set; }
}