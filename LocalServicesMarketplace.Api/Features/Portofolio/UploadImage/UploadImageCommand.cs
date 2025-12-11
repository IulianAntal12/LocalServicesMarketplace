using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Portofolio.UploadImage;

public class UploadImageCommand : IRequest<Result<UploadImageResponse>>
{
    public required IFormFile File { get; set; }
    public string? Description { get; set; }
}

public class UploadImageResponse
{
    public required int ImageId { get; set; }
    public required string ImageUrl { get; set; }
    public required string FileName { get; set; }
}