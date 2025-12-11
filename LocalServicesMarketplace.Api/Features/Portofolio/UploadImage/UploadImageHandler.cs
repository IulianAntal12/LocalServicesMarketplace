using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace LocalServicesMarketplace.Api.Features.Portofolio.UploadImage;

public class UploadImageHandler(ApplicationDbContext context, IFileStorageService fileStorage, ICurrentUserService currentUser)
    : IRequestHandler<UploadImageCommand, Result<UploadImageResponse>>
{
    private const int MaxImagesPerProvider = 20;

    public async Task<Result<UploadImageResponse>> Handle(UploadImageCommand request, CancellationToken ct)
    {
        // Validate user is a provider
        if (!currentUser.IsInRole("Provider"))
            return Result<UploadImageResponse>.Forbidden("Only providers can upload portfolio images!");

        // Check image limit
        var currentImageCount = await context.Set<PortfolioImage>()
            .CountAsync(x => x.ProviderId == currentUser.UserId, ct);

        if (currentImageCount >= MaxImagesPerProvider)
            return Result<UploadImageResponse>.BadRequest($"Maximum {MaxImagesPerProvider} images allowed!");

        // Validate and upload file
        if (!fileStorage.ValidateImage(request.File))
            return Result<UploadImageResponse>.BadRequest("Invalid image file. Max 5MB, jpg/png only!");

        try
        {
            var filePath = await fileStorage.UploadImageAsync(request.File, currentUser.UserId!);

            var portfolioImage = new PortfolioImage
            {
                ProviderId = currentUser.UserId!,
                FileName = request.File.FileName,
                FilePath = filePath,
                Description = request.Description,
                DisplayOrder = currentImageCount + 1,
                FileSizeBytes = request.File.Length,
                ContentType = request.File.ContentType ?? "image/jpeg"
            };

            context.Set<PortfolioImage>().Add(portfolioImage);
            await context.SaveChangesAsync(ct);

            return Result<UploadImageResponse>.Success(new UploadImageResponse
            {
                ImageId = portfolioImage.Id,
                ImageUrl = $"/{filePath}",
                FileName = portfolioImage.FileName
            }, HttpStatusCode.Created);
        }
        catch (Exception)
        {
            return Result<UploadImageResponse>.Failure(
                HttpStatusCode.InternalServerError,
                "Failed to upload image.");
        }
    }
}
