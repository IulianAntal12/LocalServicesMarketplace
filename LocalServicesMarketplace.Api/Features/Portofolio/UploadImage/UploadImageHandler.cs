using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace LocalServicesMarketplace.Api.Features.Portofolio.UploadImage;

public class UploadImageHandler(
    ApplicationDbContext context,
    IMongoStorageService mongoStorage,
    ICurrentUserService currentUser,
    ILogger<UploadImageHandler> logger)
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

        // Validate image
        if (!mongoStorage.ValidateImage(request.File))
            return Result<UploadImageResponse>.BadRequest("Invalid image file. Max 5MB, jpg/png/webp only!");

        try
        {
            // Upload to MongoDB GridFS
            var mongoFileId = await mongoStorage.UploadImageAsync(request.File, currentUser.UserId!);

            logger.LogInformation("Image uploaded to MongoDB. FileId: {FileId}, Provider: {ProviderId}",
                mongoFileId, currentUser.UserId);

            var portfolioImage = new PortfolioImage
            {
                ProviderId = currentUser.UserId!,
                FileName = request.File.FileName,
                FilePath = mongoFileId, // Store MongoDB ObjectId
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
                ImageUrl = $"/api/images/{mongoFileId}", // New URL format
                FileName = portfolioImage.FileName
            }, HttpStatusCode.Created);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to upload image for provider {ProviderId}", currentUser.UserId);
            return Result<UploadImageResponse>.Failure(
                HttpStatusCode.InternalServerError,
                "Failed to upload image.");
        }
    }
}