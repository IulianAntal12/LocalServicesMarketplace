using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Constants;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace LocalServicesMarketplace.Api.Features.Portofolio.DeleteImage;

public class DeletePortfolioImageHandler(
    ApplicationDbContext context,
    ICurrentUserService currentUser,
    IMongoStorageService mongoStorage,
    ILogger<DeletePortfolioImageHandler> logger)
    : IRequestHandler<DeletePortfolioImageCommand, Result>
{
    public async Task<Result> Handle(DeletePortfolioImageCommand request, CancellationToken ct)
    {
        if (!currentUser.IsInRole(Roles.Provider))
            return Result.Forbidden("Only providers can delete portfolio images!");

        var image = await context.Set<PortfolioImage>()
            .FirstOrDefaultAsync(x => x.Id == request.ImageId && x.ProviderId == currentUser.UserId, ct);

        if (image == null)
            return Result.NotFound("Image not found or you don't have permission to delete it.");

        try
        {
            // Delete from MongoDB GridFS
            await mongoStorage.DeleteImageAsync(image.FilePath);

            logger.LogInformation("Image deleted from MongoDB. FileId: {FileId}, Provider: {ProviderId}",
                image.FilePath, currentUser.UserId);

            // Remove from database
            context.Set<PortfolioImage>().Remove(image);
            await context.SaveChangesAsync(ct);

            return Result.Success(HttpStatusCode.NoContent);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to delete image {ImageId} for provider {ProviderId}",
                request.ImageId, currentUser.UserId);
            return Result.Failure(HttpStatusCode.InternalServerError, "Failed to delete image.");
        }
    }
}