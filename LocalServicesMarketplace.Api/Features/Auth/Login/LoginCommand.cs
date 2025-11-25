using LocalServicesMarketplace.Api.Features.Auth.Common;
using LocalServicesMarketplace.Core.Common;
using MediatR;

namespace LocalServicesMarketplace.Api.Features.Auth.Login;

public class LoginCommand : IRequest<Result<LoginResponse>>
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}

public class LoginResponse
{
    public required string Token { get; set; }
    public required string RefreshToken { get; set; }
    public required UserDto User { get; set; }
}