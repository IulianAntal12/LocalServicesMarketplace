using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace LocalServicesMarketplace.Api.Features.Auth.RefreshToken;

public class RefreshTokenHandler(
    UserManager<ApplicationUser> userManager,
    ITokenService tokenService)
    : IRequestHandler<RefreshTokenCommand, Result<RefreshTokenResponse>>
{
    public async Task<Result<RefreshTokenResponse>> Handle(RefreshTokenCommand request, CancellationToken ct)
    {
        var principal = GetPrincipalFromToken(request.AccessToken);
        if (principal == null)
            return Result<RefreshTokenResponse>.Unauthorized("Invalid access token.");

        var userId = GetUserIdFromPrincipal(principal);
        if (userId == null)
            return Result<RefreshTokenResponse>.Unauthorized("Invalid token claims.");

        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
            return Result<RefreshTokenResponse>.Unauthorized("User not found.");

        var validationResult = ValidateRefreshToken(user, request.RefreshToken);
        if (validationResult.IsFailure)
            return validationResult;

        return await GenerateNewTokensAsync(user);
    }

    private ClaimsPrincipal? GetPrincipalFromToken(string token)
    {
        try
        {
            return tokenService.GetPrincipalFromExpiredToken(token);
        }
        catch
        {
            return null;
        }
    }

    private static string? GetUserIdFromPrincipal(ClaimsPrincipal principal) =>
        principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    private static Result<RefreshTokenResponse> ValidateRefreshToken(ApplicationUser user, string refreshToken)
    {
        if (user.RefreshToken != refreshToken)
            return Result<RefreshTokenResponse>.Unauthorized("Invalid refresh token.");

        if (user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            return Result<RefreshTokenResponse>.Unauthorized("Refresh token expired.");

        return Result<RefreshTokenResponse>.Success(null!);
    }

    private async Task<Result<RefreshTokenResponse>> GenerateNewTokensAsync(ApplicationUser user)
    {
        var tokens = await tokenService.GenerateTokensAsync(user);

        user.RefreshToken = tokens.RefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(30);
        await userManager.UpdateAsync(user);

        var response = new RefreshTokenResponse
        {
            AccessToken = tokens.AccessToken,
            RefreshToken = tokens.RefreshToken
        };

        return Result<RefreshTokenResponse>.Success(response);
    }
}