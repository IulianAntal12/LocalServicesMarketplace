using LocalServicesMarketplace.Api.Features.SharedDTOs;
using LocalServicesMarketplace.Api.Services;
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

        var response = new ProviderProfileResponse
        {
            Id = provider.Id,
            Email = provider.Email!,
            FullName = provider.FullName,
            BusinessName = provider.BusinessName,
            BusinessDescription = provider.BusinessDescription,
            HourlyRate = provider.HourlyRate,
            ServiceAreas = provider.ServiceAreas,
            Rating = provider.Rating,
            TotalReviews = provider.TotalReviews,
            ProfilePictureUrl = provider.ProfilePictureUrl,
            Address = provider.Address,
            City = provider.City,
            PostalCode = provider.PostalCode,
            Services = [.. provider.Services.Select(s => new ServiceDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                Category = s.Category,
                BasePrice = s.BasePrice,
                PriceType = s.PriceType,
                IsActive = s.IsActive
            })],
            PortfolioImages = [.. provider.PortfolioImages
                .OrderBy(p => p.DisplayOrder)
                .Select(p => new PortfolioImageDto
                {
                    Id = p.Id,
                    ImageUrl = "/" + p.FilePath,
                    Description = p.Description,
                    UploadedAt = p.UploadedAt
                })]
        };

        return Result<ProviderProfileResponse>.Success(response);
    }
}