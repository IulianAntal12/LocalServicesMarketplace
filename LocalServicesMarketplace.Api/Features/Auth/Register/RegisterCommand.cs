using LocalServicesMarketplace.Api.Features.Auth.Common;
using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Auth.Register;

public class RegisterCommand : IRequest<Result<RegisterResponse>>
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Role { get; set; }

    // Location - Required for all users
    public required string County { get; set; } //Judet
    public required string City { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    // Provider-only fields
    public string? PhoneNumber { get; set; }
    public string? BusinessName { get; set; }
    public string? BusinessDescription { get; set; }
}

public class RegisterResponse
{
    public required string Token { get; set; }
    public required string RefreshToken { get; set; }
    public required UserDto User { get; set; }
}