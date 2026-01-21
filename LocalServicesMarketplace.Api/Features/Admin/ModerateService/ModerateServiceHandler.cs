using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Admin.ModerateService;

public class ModerateServiceHandler(
    ApplicationDbContext context,
    ICurrentUserService currentUser,
    INotificationService notificationService,
    ILogger<ModerateServiceHandler> logger)
    : IRequestHandler<ModerateServiceCommand, Result<ModerateServiceResponse>>
{
    public async Task<Result<ModerateServiceResponse>> Handle(ModerateServiceCommand request, CancellationToken ct)
    {
        var service = await context.Services
            .Include(s => s.Provider)
            .FirstOrDefaultAsync(s => s.Id == request.ServiceId, ct);

        if (service == null)
            return Result<ModerateServiceResponse>.NotFound("Service not found");

        var oldStatus = service.ModerationStatus;
        ModerationStatus newStatus;
        string message;

        if (request.Action.Equals("approve", StringComparison.OrdinalIgnoreCase))
        {
            newStatus = ModerationStatus.Approved;
            service.IsActive = true;
            message = "Service approved successfully";

            // Notify provider
            await notificationService.CreateAsync(
                service.ProviderId,
                "Service Approved",
                $"Your service '{service.Name}' has been approved and is now visible to customers.",
                NotificationType.General);
        }
        else if (request.Action.Equals("reject", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(request.Reason))
                return Result<ModerateServiceResponse>.BadRequest("Reason is required when rejecting a service");

            newStatus = ModerationStatus.AdminRejected;
            service.IsActive = false;
            message = "Service rejected";

            // Notify provider
            await notificationService.CreateAsync(
                service.ProviderId,
                "Service Rejected",
                $"Your service '{service.Name}' has been rejected. Reason: {request.Reason}",
                NotificationType.General);
        }
        else
        {
            return Result<ModerateServiceResponse>.BadRequest("Invalid action. Use 'approve' or 'reject'");
        }

        service.ModerationStatus = newStatus;
        service.ModerationReason = request.Reason ?? service.ModerationReason;
        service.ModeratedAt = DateTime.UtcNow;
        service.ModeratedBy = currentUser.UserId;

        // Create moderation log
        var moderationLog = new ModerationLog
        {
            ServiceId = service.Id,
            OldStatus = oldStatus,
            NewStatus = newStatus,
            Reason = request.Reason,
            ModeratedBy = currentUser.UserId,
            CreatedAt = DateTime.UtcNow
        };

        context.ModerationLogs.Add(moderationLog);
        await context.SaveChangesAsync(ct);

        logger.LogInformation(
            "Admin {AdminId} moderated service {ServiceId}: {OldStatus} -> {NewStatus}. Reason: {Reason}",
            currentUser.UserId,
            service.Id,
            oldStatus,
            newStatus,
            request.Reason);

        return Result<ModerateServiceResponse>.Success(new ModerateServiceResponse
        {
            ServiceId = service.Id,
            NewStatus = newStatus.ToString(),
            Message = message
        });
    }
}