using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Constants;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace LocalServicesMarketplace.Api.Features.Portofolio.DeleteImage;

public class DeletePortfolioImageHandler(ApplicationDbContext context, ICurrentUserService currentUser, IFileStorageService fileStorage)
    : IRequestHandler<DeletePortfolioImageCommand, Result>
{
    public async Task<Result> Handle(DeletePortfolioImageCommand request, CancellationToken ct)
    {
        if (!currentUser.IsInRole(Roles.Provider))
            return Result.Forbidden("Only providers can delete portfolio images!");

        var image = await context.Set<PortfolioImage>()
            .FirstOrDefaultAsync(x => x.Id == request.ImageId && x.ProviderId == currentUser.UserId,
                ct);

        if (image == null)
            return Result.NotFound("Image not found or you don't have permission to delete it.");

        await fileStorage.DeleteImageAsync(image.FilePath);

        context.Set<PortfolioImage>().Remove(image);
        await context.SaveChangesAsync(ct);

        return Result.Success(HttpStatusCode.NoContent);
    }
}