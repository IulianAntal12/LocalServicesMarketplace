using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace LocalServicesMarketplace.Api.Services.Implementations;

public class TokenService(
    IConfiguration configuration,
    UserManager<ApplicationUser> userManager) : ITokenService
{
    public async Task<TokenResult> GenerateTokensAsync(ApplicationUser user)
    {
        var claims = await BuildClaimsAsync(user);
        var accessToken = GenerateAccessToken(claims);
        var refreshToken = GenerateRefreshToken();

        return new(accessToken, refreshToken);
    }

    private async Task<List<Claim>> BuildClaimsAsync(ApplicationUser user)
    {
        var roles = await userManager.GetRolesAsync(user);

        List<Claim> claims = [
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, user.FullName),
            new("FirstName", user.FirstName),
            new("LastName", user.LastName)
        ];

        if (!string.IsNullOrEmpty(user.BusinessName))
            claims.Add(new("BusinessName", user.BusinessName));

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        return claims;
    }

    private string GenerateAccessToken(List<Claim> claims)
    {
        var key = GetSecurityKey();
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddMinutes(GetTokenExpiryMinutes());

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        try
        {
            var tokenValidationParameters = GetTokenValidationParameters(validateLifetime: false);
            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

            if (securityToken is not JwtSecurityToken jwtToken ||
                !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid token!");
            }

            return principal;
        }
        catch
        {
            return null;
        }
    }

    private SymmetricSecurityKey GetSecurityKey() =>
        new(Encoding.UTF8.GetBytes(configuration["Jwt:Key"] ??
            throw new InvalidOperationException("JWT Key not configured")));

    private int GetTokenExpiryMinutes() =>
        int.TryParse(configuration["Jwt:ExpiryMinutes"], out var minutes) ? minutes : 60;

    private TokenValidationParameters GetTokenValidationParameters(bool validateLifetime = true) => new()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = validateLifetime,
        ValidateIssuerSigningKey = true,
        ValidIssuer = configuration["Jwt:Issuer"],
        ValidAudience = configuration["Jwt:Audience"],
        IssuerSigningKey = GetSecurityKey(),
        ClockSkew = TimeSpan.Zero
    };
}