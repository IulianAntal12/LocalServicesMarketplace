using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Reviews.CreateReview;

public class CreateReviewCommand : IRequest<Result<CreateReviewResponse>>
{
    public required string ProviderId { get; set; }
    public int? ServiceId { get; set; }
    public int Rating { get; set; }
    public required string Title { get; set; }
    public required string Comment { get; set; }
}

public class CreateReviewResponse
{
    public int ReviewId { get; set; }
    public required string Message { get; set; }
}