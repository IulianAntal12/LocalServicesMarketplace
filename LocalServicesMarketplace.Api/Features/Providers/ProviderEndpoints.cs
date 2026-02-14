using LocalServicesMarketplace.Api.Endpoints;
using LocalServicesMarketplace.Api.Extensions;
using LocalServicesMarketplace.Api.Features.Providers.GetProfile;
using LocalServicesMarketplace.Api.Features.Providers.Services.CreateService;
using LocalServicesMarketplace.Api.Features.Providers.UpdateProfile;
using LocalServicesMarketplace.Api.Features.SharedDTOs;
using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Constants;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Providers;

public class ProviderEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/providers")
            .WithTags("Providers")
            .RequireAuthorization();

        // Public endpoints
        group.MapGet("/", GetAllProvidersAsync)
            .AllowAnonymous()
            .WithName("GetAllProviders")
            .WithSummary("Get all active providers")
            .Produces<List<ProviderListDto>>();

        group.MapGet("/{providerId}", GetProviderByIdAsync)
            .AllowAnonymous()
            .WithName("GetProviderById")
            .WithSummary("Get provider profile by ID")
            .Produces<ProviderProfileResponse>();

        group.MapGet("/search", SearchProvidersAsync)
            .AllowAnonymous()
            .WithName("SearchProvidersByFilter")
            .WithSummary("Search providers by category or location")
            .Produces<List<ProviderListDto>>();

        // Provider-only endpoints
        group.MapGet("/profile/me", GetMyProfileAsync)
            .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Provider })
            .WithName("GetMyProfile")
            .WithSummary("Get current provider's profile")
            .Produces<ProviderProfileResponse>();

        group.MapPut("/profile", UpdateProfileAsync)
            .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Provider })
            .WithName("UpdateProviderProfile")
            .WithSummary("Update provider profile")
            .Produces<UpdateProviderProfileResponse>();

        // Services management
        group.MapPost("/services", CreateServiceAsync)
            .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Provider })
            .WithName("CreateService")
            .WithSummary("Create a new service")
            .Produces<CreateServiceResponse>(StatusCodes.Status201Created);

        group.MapGet("/{providerId}/services", GetProviderServicesAsync)
            .AllowAnonymous()
            .WithName("GetProviderServices")
            .WithSummary("Get services by provider")
            .Produces<List<ServiceDto>>();

        group.MapPut("/services/{serviceId}", UpdateServiceAsync)
            .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Provider })
            .WithName("UpdateService")
            .WithSummary("Update service details with AI re-moderation")
            .Produces<UpdateServiceResponse>();

        group.MapDelete("/services/{serviceId}", DeleteServiceAsync)
            .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Provider })
            .WithName("DeleteService")
            .WithSummary("Delete a service")
            .Produces(StatusCodes.Status204NoContent);
    }

    private static async Task<IResult> GetAllProvidersAsync(ApplicationDbContext context, CancellationToken ct)
    {
        var providers = await context.Users
            .Where(u => u.IsActive && u.BusinessName != null)
            .Select(u => new ProviderListDto
            {
                Id = u.Id,
                BusinessName = u.BusinessName!,
                BusinessDescription = u.BusinessDescription,
                Rating = u.Rating,
                TotalReviews = u.TotalReviews,
                City = u.City,
                ServiceAreas = u.ServiceAreas,
                ServiceCount = u.Services.Count(s => s.IsActive && s.ModerationStatus == ModerationStatus.Approved),
                PortfolioImageCount = u.PortfolioImages.Count()
            })
            .ToListAsync(ct);

        return Results.Ok(providers);
    }

    private static async Task<IResult> GetProviderByIdAsync(string providerId, IMediator mediator, CancellationToken ct)
    {
        var query = new GetProviderProfileQuery { ProviderId = providerId };
        var result = await mediator.Send(query, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> SearchProvidersAsync(
        [FromQuery] string? category,
        [FromQuery] string? location,
        ApplicationDbContext context,
        CancellationToken ct)
    {
        var query = context.Users
            .Where(u => u.IsActive && u.BusinessName != null);

        if (!string.IsNullOrEmpty(location))
        {
            query = query.Where(u => u.City!.Contains(location) || u.ServiceAreas.Any(sa => sa.Contains(location)));
        }

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(u => u.Services.Any(s => s.Category == category && s.IsActive && s.ModerationStatus == ModerationStatus.Approved));
        }

        var providers = await query
            .Select(u => new ProviderListDto
            {
                Id = u.Id,
                BusinessName = u.BusinessName!,
                BusinessDescription = u.BusinessDescription,
                Rating = u.Rating,
                TotalReviews = u.TotalReviews,
                City = u.City,
                ServiceAreas = u.ServiceAreas,
                ServiceCount = u.Services.Count(s => s.IsActive && s.ModerationStatus == ModerationStatus.Approved),
                PortfolioImageCount = u.PortfolioImages.Count()
            })
            .ToListAsync(ct);

        return Results.Ok(providers);
    }

    private static async Task<IResult> GetMyProfileAsync(IMediator mediator, CancellationToken ct)
    {
        var query = new GetProviderProfileQuery();
        var result = await mediator.Send(query, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> UpdateProfileAsync(
        [FromBody] UpdateProviderProfileCommand command,
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> CreateServiceAsync(
        [FromBody] CreateServiceCommand command,
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> GetProviderServicesAsync(
        string providerId,
        ApplicationDbContext context,
        CancellationToken ct)
    {
        var services = await context.Set<Service>()
            .Where(s => s.ProviderId == providerId && s.IsActive && s.ModerationStatus == ModerationStatus.Approved)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new ServiceDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                Category = s.Category,
                BasePrice = s.BasePrice,
                PriceType = s.PriceType,
                EstimatedDurationMinutes = s.EstimatedDurationMinutes,
                IsActive = s.IsActive
            })
            .ToListAsync(ct);

        return Results.Ok(services);
    }

    private static async Task<IResult> UpdateServiceAsync(
        int serviceId,
        [FromBody] UpdateServiceRequest request,
        ApplicationDbContext context,
        ICurrentUserService currentUser,
        IGeminiService geminiService,
        ILogger<ProviderEndpoints> logger,
        CancellationToken ct)
    {
        var service = await context.Set<Service>()
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.ProviderId == currentUser.UserId, ct);

        if (service == null)
            return Results.NotFound();

        // Check if content changed (name or description)
        var nameChanged = request.Name != null && request.Name != service.Name;
        var descriptionChanged = request.Description != null && request.Description != service.Description;

        // Update fields
        service.Name = request.Name ?? service.Name;
        service.Description = request.Description ?? service.Description;
        service.BasePrice = request.BasePrice ?? service.BasePrice;
        service.PriceType = request.PriceType ?? service.PriceType;
        service.EstimatedDurationMinutes = request.EstimatedDurationMinutes ?? service.EstimatedDurationMinutes;
        service.UpdatedAt = DateTime.UtcNow;

        // Update IsActive if provided (only if service is approved)
        if (request.IsActive.HasValue)
        {
            // Only allow activating if service is approved
            if (request.IsActive.Value && service.ModerationStatus != ModerationStatus.Approved)
            {
                return Results.BadRequest("Cannot activate a service that is not approved.");
            }
            service.IsActive = request.IsActive.Value;
        }

        // Always re-run AI moderation when name or description changes
        if (nameChanged || descriptionChanged)
        {
            logger.LogInformation("Content changed for service {ServiceId}, re-running AI moderation", serviceId);

            var moderationResult = await geminiService.ModerateServiceAsync(
                service.Name,
                service.Description,
                service.Category,
                service.BasePrice,
                ct);

            logger.LogInformation(
                "AI Moderation result for updated service '{ServiceName}': Approved={IsApproved}, Reason={Reason}",
                service.Name,
                moderationResult.IsApproved,
                moderationResult.Reason);

            var oldStatus = service.ModerationStatus;

            // Update moderation status based on AI result
            service.ModerationStatus = moderationResult.IsApproved
                ? ModerationStatus.Approved
                : ModerationStatus.AiRejected;
            service.ModerationReason = moderationResult.Reason;
            service.ModeratedAt = DateTime.UtcNow;
            service.ModeratedBy = null; // null indicates AI moderation
            service.IsActive = moderationResult.IsApproved && (request.IsActive ?? service.IsActive);

            // Create moderation log
            var moderationLog = new ModerationLog
            {
                ServiceId = service.Id,
                OldStatus = oldStatus,
                NewStatus = service.ModerationStatus,
                Reason = moderationResult.Reason,
                ModeratedBy = null, // AI
                CreatedAt = DateTime.UtcNow
            };
            context.ModerationLogs.Add(moderationLog);

            await context.SaveChangesAsync(ct);

            var message = moderationResult.IsApproved
                ? "Service updated and approved!"
                : "Service updated but requires review. Reason: " + moderationResult.Reason;

            return Results.Ok(new UpdateServiceResponse
            {
                ServiceId = service.Id,
                Message = message,
                ModerationStatus = service.ModerationStatus.ToString(),
                ModerationReason = moderationResult.IsApproved ? null : moderationResult.Reason,
                IsActive = service.IsActive
            });
        }

        // No content change, just save
        await context.SaveChangesAsync(ct);

        return Results.Ok(new UpdateServiceResponse
        {
            ServiceId = service.Id,
            Message = "Service updated successfully!",
            ModerationStatus = service.ModerationStatus.ToString(),
            ModerationReason = null,
            IsActive = service.IsActive
        });
    }

    private static async Task<IResult> DeleteServiceAsync(
        int serviceId,
        ApplicationDbContext context,
        ICurrentUserService currentUser,
        CancellationToken ct)
    {
        var service = await context.Set<Service>()
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.ProviderId == currentUser.UserId, ct);

        if (service == null)
            return Results.NotFound();

        context.Set<Service>().Remove(service);
        await context.SaveChangesAsync(ct);

        return Results.NoContent();
    }
}

// DTOs for Provider endpoints
public class ProviderListDto
{
    public required string Id { get; set; }
    public required string BusinessName { get; set; }
    public string? BusinessDescription { get; set; }
    public double? Rating { get; set; }
    public int TotalReviews { get; set; }
    public string? City { get; set; }
    public List<string> ServiceAreas { get; set; } = [];
    public int ServiceCount { get; set; }
    public int PortfolioImageCount { get; set; }
}

public class UpdateServiceRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public decimal? BasePrice { get; set; }
    public string? PriceType { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public bool? IsActive { get; set; }
}

public class UpdateServiceResponse
{
    public int ServiceId { get; set; }
    public required string Message { get; set; }
    public string? ModerationStatus { get; set; }
    public string? ModerationReason { get; set; }
    public bool IsActive { get; set; }
}
