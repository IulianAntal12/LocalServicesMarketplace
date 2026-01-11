using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Bookings.GetMyBookings;

public class GetMyBookingsQuery : IRequest<Result<GetMyBookingsResponse>>
{
    public string? Status { get; set; } // Filter by status
    public string? Role { get; set; } // "customer" or "provider" - which bookings to fetch
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string SortBy { get; set; } = "newest"; // newest, oldest, scheduled
}

public class GetMyBookingsResponse
{
    public List<BookingListItemDto> Bookings { get; set; } = [];
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
    public BookingStats Stats { get; set; } = new();
}

public class BookingStats
{
    public int Pending { get; set; }
    public int Confirmed { get; set; }
    public int InProgress { get; set; }
    public int Completed { get; set; }
    public int Cancelled { get; set; }
    public int Total { get; set; }
}