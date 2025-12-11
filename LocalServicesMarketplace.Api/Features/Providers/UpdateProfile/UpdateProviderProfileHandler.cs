using FluentValidation;
using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Constants;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Providers.UpdateProfile;

public class UpdateProviderProfileHandler(ApplicationDbContext context, ICurrentUserService currentUser, IValidator<UpdateProviderProfileCommand> validator)
    : IRequestHandler<UpdateProviderProfileCommand, Result<UpdateProviderProfileResponse>>
{
    public async Task<Result<UpdateProviderProfileResponse>> Handle(UpdateProviderProfileCommand request, CancellationToken ct)
    {
        if (!currentUser.IsInRole(Roles.Provider))
            return Result<UpdateProviderProfileResponse>.Forbidden("Only providers can update profiles.");

        var validationResult = await validator.ValidateAsync(request, ct);
        if (!validationResult.IsValid)
            return Result<UpdateProviderProfileResponse>.ValidationFailure(
                [.. validationResult.Errors.Select(e => e.ErrorMessage)]);

        var provider = await context.Users
            .FirstOrDefaultAsync(u => u.Id == currentUser.UserId, ct);

        if (provider == null)
            return Result<UpdateProviderProfileResponse>.NotFound("Provider not found!");

        // Update only provided fields
        if (request.BusinessName != null)
            provider.BusinessName = request.BusinessName;

        if (request.BusinessDescription != null)
            provider.BusinessDescription = request.BusinessDescription;

        if (request.HourlyRate.HasValue)
            provider.HourlyRate = request.HourlyRate.Value;

        if (request.ServiceAreas != null)
            provider.ServiceAreas = request.ServiceAreas;

        if (request.Address != null)
            provider.Address = request.Address;

        if (request.City != null)
            provider.City = request.City;

        if (request.PostalCode != null)
            provider.PostalCode = request.PostalCode;

        if (request.Latitude.HasValue)
            provider.Latitude = request.Latitude.Value;

        if (request.Longitude.HasValue)
            provider.Longitude = request.Longitude.Value;

        if (request.ServiceRadiusKm.HasValue)
            provider.ServiceRadiusKm = request.ServiceRadiusKm.Value;

        await context.SaveChangesAsync(ct);

        return Result<UpdateProviderProfileResponse>.Success(
            new UpdateProviderProfileResponse { Message = "Profile updated successfully!" });
    }
}