using LocalServicesMarketplace.Api.Endpoints;
using LocalServicesMarketplace.Api.Services.Interfaces;

namespace LocalServicesMarketplace.Api.Features.Images;

public class ImageEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/images")
            .WithTags("Images")
            .AllowAnonymous();

        group.MapGet("/{fileId}", GetImageAsync)
            .WithName("GetImage")
            .WithSummary("Get image from MongoDB GridFS")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .CacheOutput(p => p.Expire(TimeSpan.FromHours(24))); // Cache images for 24 hours
    }

    private static async Task<IResult> GetImageAsync(
        string fileId,
        IMongoStorageService storageService,
        CancellationToken ct)
    {
        var result = await storageService.GetImageAsync(fileId);

        if (result == null)
            return Results.NotFound("Image not found");

        return Results.File(result.Value.Content, result.Value.ContentType);
    }
}