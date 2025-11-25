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
    public string? BusinessName { get; set; }
    public string? BusinessDescription { get; set; }
}

public class RegisterResponse
{
    public required string Token { get; set; }
    public required string RefreshToken { get; set; }
    public required UserDto User { get; set; }
}