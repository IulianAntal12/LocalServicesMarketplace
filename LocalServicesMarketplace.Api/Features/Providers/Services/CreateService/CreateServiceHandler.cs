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

public class CreateServiceHandler(
    ApplicationDbContext context,
    ICurrentUserService currentUser,
    IValidator<CreateServiceCommand> validator,
    IGeminiService geminiService,
    ILogger<CreateServiceHandler> logger)
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

        // AI Moderation
        var moderationResult = await geminiService.ModerateServiceAsync(
            request.Name,
            request.Description,
            request.Category,
            request.BasePrice,
            ct);

        logger.LogInformation(
            "AI Moderation result for service '{ServiceName}': Approved={IsApproved}, Reason={Reason}, Confidence={Confidence}",
            request.Name,
            moderationResult.IsApproved,
            moderationResult.Reason,
            moderationResult.ConfidenceScore);

        var service = new Service
        {
            ProviderId = currentUser.UserId!,
            Name = request.Name,
            Description = request.Description,
            Category = request.Category,
            BasePrice = request.BasePrice,
            PriceType = request.PriceType,
            EstimatedDurationMinutes = request.EstimatedDurationMinutes,
            IsActive = moderationResult.IsApproved, // Only active if approved
            ModerationStatus = moderationResult.IsApproved
                ? ModerationStatus.Approved
                : ModerationStatus.AiRejected,
            ModerationReason = moderationResult.Reason,
            ModeratedAt = DateTime.UtcNow,
            ModeratedBy = null // null indicates AI moderation
        };

        context.Set<Service>().Add(service);

        // Create moderation log
        var moderationLog = new ModerationLog
        {
            ServiceId = service.Id,
            OldStatus = ModerationStatus.Pending,
            NewStatus = service.ModerationStatus,
            Reason = moderationResult.Reason,
            ModeratedBy = null,
            CreatedAt = DateTime.UtcNow
        };

        // We need to save first to get the service ID
        await context.SaveChangesAsync(ct);

        // Now add the log with the correct service ID
        moderationLog.ServiceId = service.Id;
        context.ModerationLogs.Add(moderationLog);
        await context.SaveChangesAsync(ct);

        var message = moderationResult.IsApproved
            ? "Service created and approved successfully!"
            : "Service created but requires admin review. Reason: " + moderationResult.Reason;

        return Result<CreateServiceResponse>.Success(
            new CreateServiceResponse
            {
                ServiceId = service.Id,
                Message = message,
                ModerationStatus = service.ModerationStatus.ToString(),
                ModerationReason = moderationResult.IsApproved ? null : moderationResult.Reason
            },
            HttpStatusCode.Created);
    }
}