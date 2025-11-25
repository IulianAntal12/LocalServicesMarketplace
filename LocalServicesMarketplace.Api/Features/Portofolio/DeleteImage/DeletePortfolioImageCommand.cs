using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Portofolio.DeleteImage;

public class DeletePortfolioImageCommand : IRequest<Result>
{
    public int ImageId { get; set; }
}