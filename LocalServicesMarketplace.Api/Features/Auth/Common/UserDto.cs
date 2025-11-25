namespace LocalServicesMarketplace.Api.Features.Auth.Common;

public class UserDto
{
    public required string Id { get; set; }
    public required string Email { get; set; }
    public required string FullName { get; set; }
    public required List<string> Roles { get; set; }
    public string? BusinessName { get; set; }
}