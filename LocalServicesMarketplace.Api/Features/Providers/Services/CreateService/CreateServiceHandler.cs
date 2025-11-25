using FluentValidation;
using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Constants;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace LocalServicesMarketplace.Api.Features.Providers.Services.CreateService;

public class CreateServiceHandler(ApplicationDbContext context, ICurrentUserService currentUser, IValidator<CreateServiceCommand> validator)
    : IRequestHandler<CreateServiceCommand, Result<CreateServiceResponse>>
{
    private const int MaxServicesPerProvider = 50;

    public async Task<Result<CreateServiceResponse>> Handle(CreateServiceCommand request, CancellationToken ct)
    {
        if (!currentUser.IsInRole(Roles.Provider))
            return Result<CreateServiceResponse>.Forbidden("Only providers can create services!");

        var validationResult = await validator.ValidateAsync(request, ct);
        if (!validationResult.IsValid)
            return Result<CreateServiceResponse>.ValidationFailure(
                [.. validationResult.Errors.Select(e => e.ErrorMessage)]);

        var serviceCount = await context.Set<Service>()
            .CountAsync(s => s.ProviderId == currentUser.UserId, ct);

        if (serviceCount >= MaxServicesPerProvider)
            return Result<CreateServiceResponse>.BadRequest(
                $"Maximum {MaxServicesPerProvider} services allowed per provider.");

        var service = new Service
        {
            ProviderId = currentUser.UserId!,
            Name = request.Name,
            Description = request.Description,
            Category = request.Category,
            BasePrice = request.BasePrice,
            PriceType = request.PriceType,
            EstimatedDurationMinutes = request.EstimatedDurationMinutes,
            IsActive = true
        };

        context.Set<Service>().Add(service);
        await context.SaveChangesAsync(ct);

        return Result<CreateServiceResponse>.Success(
            new CreateServiceResponse
            {
                ServiceId = service.Id,
                Message = "Service created successfully!"
            },
            HttpStatusCode.Created);
    }
}