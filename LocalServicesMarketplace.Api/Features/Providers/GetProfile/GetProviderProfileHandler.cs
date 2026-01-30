using LocalServicesMarketplace.Api.Features.SharedDTOs;
using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Constants;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Providers.GetProfile;

public class GetProviderProfileHandler(ApplicationDbContext context, ICurrentUserService currentUser)
    : IRequestHandler<GetProviderProfileQuery, Result<ProviderProfileResponse>>
{
    public async Task<Result<ProviderProfileResponse>> Handle(GetProviderProfileQuery request, CancellationToken ct)
    {
        var providerId = request.ProviderId;

        if (string.IsNullOrEmpty(providerId))
        {
            if (!currentUser.IsInRole(Roles.Provider))
                return Result<ProviderProfileResponse>.Forbidden("You are not a provider!");

            providerId = currentUser.UserId;
        }

        var provider = await context.Users
            .Include(u => u.Services)
            .Include(u => u.PortfolioImages)
            .FirstOrDefaultAsync(u => u.Id == providerId, ct);

        if (provider == null)
            return Result<ProviderProfileResponse>.NotFound("Provider not found.");

        // Check if this is the provider viewing their own profile
        var isOwnProfile = currentUser.UserId == providerId;

        var response = new ProviderProfileResponse
        {
            Id = provider.Id,
            Email = provider.Email!,
            FullName = provider.FullName,
            BusinessName = provider.BusinessName,
            BusinessDescription = provider.BusinessDescription,
            PhoneNumber = provider.PhoneNumber,
            HourlyRate = provider.HourlyRate,
            ServiceAreas = provider.ServiceAreas,
            Rating = provider.Rating,
            TotalReviews = provider.TotalReviews,
            ProfilePictureUrl = provider.ProfilePictureUrl,
            Address = provider.Address,
            City = provider.City,
            PostalCode = provider.PostalCode,
            Latitude = provider.Latitude,
            Longitude = provider.Longitude,
            ServiceRadiusKm = provider.ServiceRadiusKm,
            Services = [.. provider.Services
                .Where(s => isOwnProfile || (s.IsActive && s.ModerationStatus == Core.Entities.ModerationStatus.Approved))
                .Select(s => new ServiceDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    Category = s.Category,
                    BasePrice = s.BasePrice,
                    PriceType = s.PriceType,
                    EstimatedDurationMinutes = s.EstimatedDurationMinutes,
                    IsActive = s.IsActive,
                    ModerationStatus = s.ModerationStatus.ToString(),
                    ModerationReason = s.ModerationReason
                })],
            PortfolioImages = [.. provider.PortfolioImages
                .OrderBy(p => p.DisplayOrder)
                .Select(p => new PortfolioImageDto
                {
                    Id = p.Id,
                    ImageUrl = $"/api/images/{p.FilePath}", // MongoDB URL format
                    Description = p.Description,
                    UploadedAt = p.UploadedAt
                })]
        };

        return Result<ProviderProfileResponse>.Success(response);
    }
}