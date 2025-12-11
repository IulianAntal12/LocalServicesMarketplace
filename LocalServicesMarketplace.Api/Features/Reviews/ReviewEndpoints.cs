using LocalServicesMarketplace.Api.Endpoints;
using LocalServicesMarketplace.Api.Extensions;
using LocalServicesMarketplace.Api.Features.Reviews.CreateReview;
using LocalServicesMarketplace.Api.Features.Reviews.DeleteReview;
using LocalServicesMarketplace.Api.Features.Reviews.GetProviderReviews;
using LocalServicesMarketplace.Api.Features.Reviews.RespondToReview;
using LocalServicesMarketplace.Api.Features.Reviews.UpdateReview;
using LocalServicesMarketplace.Api.Features.SharedDTOs;
using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Constants;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocalServicesMarketplace.Api.Features.Reviews;

public class ReviewEndpoints : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reviews")
            .WithTags("Reviews");

        // Public endpoints
        group.MapGet("/provider/{providerId}", GetProviderReviewsAsync)
            .AllowAnonymous()
            .WithName("GetProviderReviews")
            .WithSummary("Get reviews for a provider")
            .Produces<GetProviderReviewsResponse>();

        // Customer endpoints
        group.MapPost("/", CreateReviewAsync)
            .RequireAuthorization(Roles.Customer)
            .WithName("CreateReview")
            .WithSummary("Create a review for a provider")
            .Produces<CreateReviewResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/{reviewId:int}", UpdateReviewAsync)
            .RequireAuthorization(Roles.Customer)
            .WithName("UpdateReview")
            .WithSummary("Update your review")
            .Produces<UpdateReviewResponse>()
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/my", GetMyReviewsAsync)
            .RequireAuthorization(Roles.Customer)
            .WithName("GetMyReviews")
            .WithSummary("Get reviews written by current customer")
            .Produces<List<ReviewDto>>();

        // Provider endpoints
        group.MapPost("/{reviewId:int}/respond", RespondToReviewAsync)
            .RequireAuthorization(Roles.Provider)
            .WithName("RespondToReview")
            .WithSummary("Provider responds to a review")
            .Produces<RespondToReviewResponse>()
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/received", GetReceivedReviewsAsync)
            .RequireAuthorization(Roles.Provider)
            .WithName("GetReceivedReviews")
            .WithSummary("Get reviews received by current provider")
            .Produces<GetProviderReviewsResponse>();

        // Delete (Customer, Admin, Moderator)
        group.MapDelete("/{reviewId:int}", DeleteReviewAsync)
            .RequireAuthorization()
            .WithName("DeleteReview")
            .WithSummary("Delete a review")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetProviderReviewsAsync(
        string providerId,
        [FromQuery] int page,
        [FromQuery] int pageSize,
        [FromQuery] string? sortBy,
        IMediator mediator,
        CancellationToken ct)
    {
        var query = new GetProviderReviewsQuery
        {
            ProviderId = providerId,
            Page = page > 0 ? page : 1,
            PageSize = pageSize > 0 && pageSize <= 50 ? pageSize : 10,
            SortBy = sortBy ?? "recent"
        };
        var result = await mediator.Send(query, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> CreateReviewAsync(
        [FromBody] CreateReviewCommand command,
        IMediator mediator,
        CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> UpdateReviewAsync(
        int reviewId,
        [FromBody] UpdateReviewCommand command,
        IMediator mediator,
        CancellationToken ct)
    {
        command.ReviewId = reviewId;
        var result = await mediator.Send(command, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> RespondToReviewAsync(
        int reviewId,
        [FromBody] RespondToReviewRequest request,
        IMediator mediator,
        CancellationToken ct)
    {
        var command = new RespondToReviewCommand
        {
            ReviewId = reviewId,
            Response = request.Response
        };
        var result = await mediator.Send(command, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> DeleteReviewAsync(
        int reviewId,
        IMediator mediator,
        CancellationToken ct)
    {
        var command = new DeleteReviewCommand { ReviewId = reviewId };
        var result = await mediator.Send(command, ct);
        return result.ToApiResponse();
    }

    private static async Task<IResult> GetMyReviewsAsync(
        ApplicationDbContext context,
        ICurrentUserService currentUser,
        CancellationToken ct)
    {
        var reviews = await context.Set<Review>()
            .Where(r => r.CustomerId == currentUser.UserId)
            .Include(r => r.Provider)
            .Include(r => r.Service)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                CustomerId = r.CustomerId,
                CustomerName = r.Customer.FullName,
                ProviderId = r.ProviderId,
                ServiceId = r.ServiceId,
                ServiceName = r.Service != null ? r.Service.Name : null,
                Rating = r.Rating,
                Title = r.Title,
                Comment = r.Comment,
                ProviderResponse = r.ProviderResponse,
                ProviderResponseAt = r.ProviderResponseAt,
                CreatedAt = r.CreatedAt,
                IsVerified = r.IsVerified
            })
            .ToListAsync(ct);

        return Results.Ok(reviews);
    }

    private static async Task<IResult> GetReceivedReviewsAsync(
        [FromQuery] int page,
        [FromQuery] int pageSize,
        [FromQuery] string? sortBy,
        IMediator mediator,
        ICurrentUserService currentUser,
        CancellationToken ct)
    {
        var query = new GetProviderReviewsQuery
        {
            ProviderId = currentUser.UserId!,
            Page = page > 0 ? page : 1,
            PageSize = pageSize > 0 && pageSize <= 50 ? pageSize : 10,
            SortBy = sortBy ?? "recent"
        };
        var result = await mediator.Send(query, ct);
        return result.ToApiResponse();
    }
}

public class RespondToReviewRequest
{
    public required string Response { get; set; }
}