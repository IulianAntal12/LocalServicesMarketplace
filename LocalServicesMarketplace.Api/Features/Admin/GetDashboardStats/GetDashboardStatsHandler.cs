using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Constants;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Admin.GetDashboardStats;

public class GetDashboardStatsHandler(
    ApplicationDbContext context,
    UserManager<ApplicationUser> userManager)
    : IRequestHandler<GetDashboardStatsQuery, Result<DashboardStatsDto>>
{
    public async Task<Result<DashboardStatsDto>> Handle(GetDashboardStatsQuery request, CancellationToken ct)
    {
        // Service stats by moderation status
        var serviceStats = await context.Services
            .GroupBy(s => s.ModerationStatus)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var totalServices = serviceStats.Sum(s => s.Count);
        var pendingServices = serviceStats.FirstOrDefault(s => s.Status == ModerationStatus.Pending)?.Count ?? 0;
        var aiRejectedServices = serviceStats.FirstOrDefault(s => s.Status == ModerationStatus.AiRejected)?.Count ?? 0;
        var approvedServices = serviceStats.FirstOrDefault(s => s.Status == ModerationStatus.Approved)?.Count ?? 0;
        var adminRejectedServices = serviceStats.FirstOrDefault(s => s.Status == ModerationStatus.AdminRejected)?.Count ?? 0;

        // User counts
        var providers = await userManager.GetUsersInRoleAsync(Roles.Provider);
        var customers = await userManager.GetUsersInRoleAsync(Roles.Customer);

        // Other stats
        var totalBookings = await context.Bookings.CountAsync(ct);
        var totalReviews = await context.Reviews.CountAsync(ct);

        // Recent moderation logs
        var recentModerations = await context.ModerationLogs
            .Include(m => m.Service)
            .Include(m => m.Moderator)
            .OrderByDescending(m => m.CreatedAt)
            .Take(10)
            .Select(m => new RecentModerationDto
            {
                ServiceId = m.ServiceId,
                ServiceName = m.Service.Name,
                OldStatus = m.OldStatus.ToString(),
                NewStatus = m.NewStatus.ToString(),
                Reason = m.Reason,
                ModeratorName = m.Moderator != null
                    ? m.Moderator.FirstName + " " + m.Moderator.LastName
                    : "AI System",
                CreatedAt = m.CreatedAt
            })
            .ToListAsync(ct);

        return Result<DashboardStatsDto>.Success(new DashboardStatsDto
        {
            TotalServices = totalServices,
            PendingServices = pendingServices,
            AiRejectedServices = aiRejectedServices,
            ApprovedServices = approvedServices,
            AdminRejectedServices = adminRejectedServices,
            TotalProviders = providers.Count,
            TotalCustomers = customers.Count,
            TotalBookings = totalBookings,
            TotalReviews = totalReviews,
            RecentModerations = recentModerations
        });
    }
}