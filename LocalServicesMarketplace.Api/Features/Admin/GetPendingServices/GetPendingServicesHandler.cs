using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Admin.GetPendingServices;

public class GetPendingServicesHandler(ApplicationDbContext context)
    : IRequestHandler<GetPendingServicesQuery, Result<GetServicesResponse>>
{
    public async Task<Result<GetServicesResponse>> Handle(GetPendingServicesQuery request, CancellationToken ct)
    {
        var query = context.Services
            .Include(s => s.Provider)
            .Where(s => s.ModerationStatus == ModerationStatus.Pending)
            .OrderByDescending(s => s.CreatedAt);

        var totalCount = await query.CountAsync(ct);
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

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

        return Result<GetServicesResponse>.Success(new GetServicesResponse
        {
            Services = services,
            TotalCount = totalCount,
            TotalPages = totalPages
        });
    }
}