using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Reviews.DeleteReview;

public class DeleteReviewCommand : IRequest<Result>
{
    public int ReviewId { get; set; }
}