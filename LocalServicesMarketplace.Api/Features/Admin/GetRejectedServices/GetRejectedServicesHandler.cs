using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Admin.GetRejectedServices;

public class GetRejectedServicesHandler(ApplicationDbContext context)
    : IRequestHandler<GetRejectedServicesQuery, Result<GetServicesResponse>>
{
    public async Task<Result<GetServicesResponse>> Handle(GetRejectedServicesQuery request, CancellationToken ct)
    {
        var query = context.Services
            .Include(s => s.Provider)
            .AsQueryable();

        // Filter by rejection type
        if (request.OnlyAiRejected == true)
        {
            // Only AI rejected
            query = query.Where(s => s.ModerationStatus == ModerationStatus.AiRejected);
        }
        else if (request.OnlyAiRejected == false)
        {
            // Only Admin rejected
            query = query.Where(s => s.ModerationStatus == ModerationStatus.AdminRejected);
        }
        else
        {
            // All rejected (both AI and Admin) - when OnlyAiRejected is null
            query = query.Where(s =>
                s.ModerationStatus == ModerationStatus.AiRejected ||
                s.ModerationStatus == ModerationStatus.AdminRejected);
        }

        // Get total count
        var totalCount = await query.CountAsync(ct);

        // Apply sorting
        query = query.OrderByDescending(s => s.CreatedAt);

        // Apply pagination
        var services = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(s => new ServiceModerationDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                Category = s.Category,
                BasePrice = s.BasePrice,
                PriceType = s.PriceType,
                ModerationStatus = s.ModerationStatus.ToString(),
                ModerationReason = s.ModerationReason,
                ModeratedAt = s.ModeratedAt,
                ModeratedBy = s.ModeratedBy,
                CreatedAt = s.CreatedAt,
                ProviderId = s.ProviderId,
                ProviderName = s.Provider.FirstName + " " + s.Provider.LastName,
                ProviderBusinessName = s.Provider.BusinessName,
                ProviderEmail = s.Provider.Email!
            })
            .ToListAsync(ct);

        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        return Result<GetServicesResponse>.Success(new GetServicesResponse
        {
            Services = services,
            TotalCount = totalCount,
            TotalPages = totalPages
        });
    }
}