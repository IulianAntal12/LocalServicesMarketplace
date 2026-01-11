using LocalServicesMarketplace.Api.Endpoints;
using LocalServicesMarketplace.Api.Extensions;
using LocalServicesMarketplace.Api.Features.Bookings.CancelBooking;
using LocalServicesMarketplace.Api.Features.Bookings.CreateBooking;
using LocalServicesMarketplace.Api.Features.Bookings.GetBooking;
using LocalServicesMarketplace.Api.Features.Bookings.GetMyBookings;
using LocalServicesMarketplace.Api.Features.Bookings.GetProviderAvailability;
using LocalServicesMarketplace.Api.Features.Bookings.UpdateBookingStatus;
using LocalServicesMarketplace.Core.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LocalServicesMarketplace.Api.Features.Bookings;

public class BookingEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/bookings")
            .WithTags("Bookings")
            .RequireAuthorization();

        // Create booking (Customer only)
        group.MapPost("/", CreateBookingAsync)
            .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Customer })
            .WithName("CreateBooking")
            .WithSummary("Create a new booking request")
            .Produces<CreateBookingResponse>(StatusCodes.Status201Created);

        // Get my bookings (both Customer and Provider)
        group.MapGet("/my", GetMyBookingsAsync)
            .WithName("GetMyBookings")
            .WithSummary("Get current user's bookings (as customer or provider)")
            .Produces<GetMyBookingsResponse>();

        // Get single booking
        group.MapGet("/{bookingId:int}", GetBookingAsync)
            .WithName("GetBooking")
            .WithSummary("Get booking details")
            .Produces<BookingDto>();

        // Update booking status (Provider only)
        group.MapPut("/{bookingId:int}/status", UpdateBookingStatusAsync)
            .RequireAuthorization(new AuthorizeAttribute { Roles = Roles.Provider })
            .WithName("UpdateBookingStatus")
            .WithSummary("Update booking status (confirm, start, complete, reject)")
            .Produces<UpdateBookingStatusResponse>();

        // Cancel booking (both Customer and Provider)
        group.MapPost("/{bookingId:int}/cancel", CancelBookingAsync)
            .WithName("CancelBooking")
            .WithSummary("Cancel a booking")
            .Produces<CancelBookingResponse>();

        // Get provider availability (public)
        group.MapGet("/availability/{providerId}", GetProviderAvailabilityAsync)
            .AllowAnonymous()
            .WithName("GetProviderAvailability")
            .WithSummary("Get available time slots for a provider on a specific date")
            .Produces<ProviderAvailabilityResponse>();
    }

    private static async Task<IResult> CreateBookingAsync(
        [FromBody] CreateBookingCommand command,
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> GetMyBookingsAsync(
        [FromQuery] string? status,
        [FromQuery] string? role,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? sortBy,
        IMediator mediator,
        CancellationToken ct)
    {
        var query = new GetMyBookingsQuery
        {
            Status = status,
            Role = role,
            FromDate = fromDate,
            ToDate = toDate,
            Page = page > 0 ? page.Value : 1,
            PageSize = pageSize > 0 && pageSize <= 50 ? pageSize.Value : 20,
            SortBy = sortBy ?? "newest"
        };

        var result = await mediator.Send(query, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> GetBookingAsync(
        int bookingId,
        IMediator mediator,
        CancellationToken ct)
    {
        var query = new GetBookingQuery { BookingId = bookingId };
        var result = await mediator.Send(query, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> UpdateBookingStatusAsync(
        int bookingId,
        [FromBody] UpdateBookingStatusRequest request,
        IMediator mediator,
        CancellationToken ct)
    {
        var command = new UpdateBookingStatusCommand
        {
            BookingId = bookingId,
            NewStatus = request.NewStatus,
            ProviderNotes = request.ProviderNotes,
            FinalPrice = request.FinalPrice
        };

        var result = await mediator.Send(command, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> CancelBookingAsync(
        int bookingId,
        [FromBody] CancelBookingRequest? request,
        IMediator mediator,
        CancellationToken ct)
    {
        var command = new CancelBookingCommand
        {
            BookingId = bookingId,
            CancellationReason = request?.CancellationReason
        };

        var result = await mediator.Send(command, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> GetProviderAvailabilityAsync(
        string providerId,
        [FromQuery] DateTime? date,
        IMediator mediator,
        CancellationToken ct)
    {
        var query = new GetProviderAvailabilityQuery
        {
            ProviderId = providerId,
            Date = date ?? DateTime.UtcNow.Date
        };

        var result = await mediator.Send(query, ct);
        return result.ToApiResponse();
    }
}

// Request DTOs for endpoints
public class UpdateBookingStatusRequest
{
    public required string NewStatus { get; set; }
    public string? ProviderNotes { get; set; }
    public decimal? FinalPrice { get; set; }
}

public class CancelBookingRequest
{
    public string? CancellationReason { get; set; }
}