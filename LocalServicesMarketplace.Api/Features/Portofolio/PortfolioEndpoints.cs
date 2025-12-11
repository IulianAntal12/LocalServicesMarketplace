using LocalServicesMarketplace.Api.Endpoints;
using LocalServicesMarketplace.Api.Extensions;
using LocalServicesMarketplace.Api.Features.Portofolio.DeleteImage;
using LocalServicesMarketplace.Api.Features.Portofolio.UploadImage;
using LocalServicesMarketplace.Api.Features.SharedDTOs;
using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Constants;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Portofolio;

public class PortfolioEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/portfolio")
            .WithTags("Portfolio")
            .RequireAuthorization();

        // Provider-only endpoints (authenticated)
        group.MapPost("/upload", UploadPortfolioImageAsync)
            .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Provider })
            .WithName("UploadPortfolioImage")
            .WithSummary("Upload portfolio image")
            .Produces<UploadImageResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest)
            .DisableAntiforgery();

        group.MapDelete("/{imageId}", DeletePortfolioImageAsync)
            .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Provider })
            .WithName("DeletePortfolioImage")
            .WithSummary("Delete portfolio image")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/my", GetMyPortfolioAsync)
            .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Provider })
            .WithName("GetMyPortfolio")
            .WithSummary("Get current provider's portfolio images")
            .Produces<List<PortfolioImageDto>>();

        group.MapPut("/{imageId}/reorder", ReorderPortfolioImageAsync)
            .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Provider })
            .WithName("ReorderPortfolioImage")
            .WithSummary("Update display order of portfolio image")
            .Produces(StatusCodes.Status204NoContent);

        // Public endpoints
        group.MapGet("/provider/{providerId}", GetProviderPortfolioAsync)
            .AllowAnonymous()
            .WithName("GetProviderPortfolio")
            .WithSummary("Get provider's portfolio images")
            .Produces<List<PortfolioImageDto>>();

        group.MapGet("/provider/{providerId}/count", GetProviderPortfolioCountAsync)
            .AllowAnonymous()
            .WithName("GetProviderPortfolioCount")
            .WithSummary("Get count of provider's portfolio images")
            .Produces<PortfolioCountResponse>();
    }

    private static async Task<IResult> UploadPortfolioImageAsync(IFormFile file, string? description, IMediator mediator, CancellationToken ct)
    {
        var command = new UploadImageCommand
        {
            File = file,
            Description = description
        };
        var result = await mediator.Send(command, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> DeletePortfolioImageAsync(int imageId, IMediator mediator, CancellationToken ct)
    {
        var command = new DeletePortfolioImageCommand { ImageId = imageId };
        var result = await mediator.Send(command, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> GetMyPortfolioAsync(ApplicationDbContext context, ICurrentUserService currentUser, CancellationToken ct)
    {
        var images = await context.Set<PortfolioImage>()
            .Where(p => p.ProviderId == currentUser.UserId)
            .OrderBy(p => p.DisplayOrder)
            .Select(p => new PortfolioImageDto
            {
                Id = p.Id,
                ImageUrl = "/" + p.FilePath,
                Description = p.Description,
                DisplayOrder = p.DisplayOrder,
                UploadedAt = p.UploadedAt
            })
            .ToListAsync(ct);

        return Results.Ok(images);
    }

    private static async Task<IResult> GetProviderPortfolioAsync(string providerId, ApplicationDbContext context, CancellationToken ct)
    {
        var images = await context.Set<PortfolioImage>()
            .Where(p => p.ProviderId == providerId)
            .OrderBy(p => p.DisplayOrder)
            .Select(p => new PortfolioImageDto
            {
                Id = p.Id,
                ImageUrl = "/" + p.FilePath,
                Description = p.Description,
                DisplayOrder = p.DisplayOrder,
                UploadedAt = p.UploadedAt
            })
            .ToListAsync(ct);

        return Results.Ok(images);
    }

    private static async Task<IResult> GetProviderPortfolioCountAsync(string providerId, ApplicationDbContext context, CancellationToken ct)
    {
        var count = await context.Set<PortfolioImage>()
            .CountAsync(p => p.ProviderId == providerId, ct);

        return Results.Ok(new PortfolioCountResponse { Count = count });
    }

    private static async Task<IResult> ReorderPortfolioImageAsync(
        int imageId,
        ReorderRequest request,
        ApplicationDbContext context,
        ICurrentUserService currentUser,
        CancellationToken ct)
    {
        var image = await context.Set<PortfolioImage>()
            .FirstOrDefaultAsync(p => p.Id == imageId && p.ProviderId == currentUser.UserId, ct);

        if (image == null)
            return Results.NotFound();

        image.DisplayOrder = request.NewOrder;
        await context.SaveChangesAsync(ct);

        return Results.NoContent();
    }
}

// DTOs for Portfolio endpoints
public class PortfolioCountResponse
{
    public int Count { get; set; }
}

public class ReorderRequest
{
    public int NewOrder { get; set; }
}