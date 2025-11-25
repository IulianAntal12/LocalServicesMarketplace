using LocalServicesMarketplace.Core.Entities;
using System.Security.Claims;

namespace LocalServicesMarketplace.Api.Services.Interfaces;

public interface ITokenService
{
    Task<TokenResult> GenerateTokensAsync(ApplicationUser user);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}

public record TokenResult(string AccessToken, string RefreshToken);