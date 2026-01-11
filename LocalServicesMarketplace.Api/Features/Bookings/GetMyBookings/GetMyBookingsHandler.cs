using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Bookings.GetMyBookings;

public class GetMyBookingsHandler(
    ApplicationDbContext context,
    ICurrentUserService currentUser)
    : IRequestHandler<GetMyBookingsQuery, Result<GetMyBookingsResponse>>
{
    public async Task<Result<GetMyBookingsResponse>> Handle(
        GetMyBookingsQuery request,
        CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId;
        if (string.IsNullOrEmpty(userId))
            return Result<GetMyBookingsResponse>.Unauthorized();

        // Determine role - default based on what role they have
        var isProvider = request.Role?.ToLower() == "provider";

        var query = context.Set<Booking>()
            .Include(b => b.Customer)
            .Include(b => b.Provider)
            .Include(b => b.Service)
            .AsQueryable();

        // Filter by user's role in the booking
        if (isProvider)
        {
            query = query.Where(b => b.ProviderId == userId);
        }
        else
        {
            query = query.Where(b => b.CustomerId == userId);
        }

        // Filter by status
        if (!string.IsNullOrEmpty(request.Status) &&
            Enum.TryParse<BookingStatus>(request.Status, true, out var status))
        {
            query = query.Where(b => b.Status == status);
        }

        // Filter by date range
        if (request.FromDate.HasValue)
        {
            query = query.Where(b => b.ScheduledDate >= request.FromDate.Value.Date);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(b => b.ScheduledDate <= request.ToDate.Value.Date);
        }

        // Get stats before pagination
        var statsQuery = isProvider
            ? context.Set<Booking>().Where(b => b.ProviderId == userId)
            : context.Set<Booking>().Where(b => b.CustomerId == userId);

        var stats = new BookingStats
        {
            Pending = await statsQuery.CountAsync(b => b.Status == BookingStatus.Pending, cancellationToken),
            Confirmed = await statsQuery.CountAsync(b => b.Status == BookingStatus.Confirmed, cancellationToken),
            InProgress = await statsQuery.CountAsync(b => b.Status == BookingStatus.InProgress, cancellationToken),
            Completed = await statsQuery.CountAsync(b => b.Status == BookingStatus.Completed, cancellationToken),
            Cancelled = await statsQuery.CountAsync(b =>
                b.Status == BookingStatus.Cancelled || b.Status == BookingStatus.Rejected, cancellationToken),
        };
        stats.Total = stats.Pending + stats.Confirmed + stats.InProgress + stats.Completed + stats.Cancelled;

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Sorting
        query = request.SortBy.ToLower() switch
        {
            "oldest" => query.OrderBy(b => b.CreatedAt),
            "scheduled" => query.OrderBy(b => b.ScheduledDate).ThenBy(b => b.ScheduledTime),
            _ => query.OrderByDescending(b => b.CreatedAt) // newest
        };

        // Pagination
        var bookings = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        return Result<GetMyBookingsResponse>.Success(new GetMyBookingsResponse
        {
            Bookings = bookings.Select(b => b.ToListItemDto()).ToList(),
            TotalCount = totalCount,
            TotalPages = totalPages,
            CurrentPage = request.Page,
            Stats = stats
        });
    }
}


