using FluentValidation;
using LocalServicesMarketplace.Api.Features.Auth.Common;
using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace LocalServicesMarketplace.Api.Features.Auth.Login;

public class LoginHandler(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    ITokenService tokenService,
    IValidator<LoginCommand> validator)
    : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken ct)
    {
        var validationResult = await ValidateRequestAsync(request, ct);
        if (validationResult.IsFailure)
            return validationResult;

        var user = await FindUserAsync(request.Email);
        if (user == null)
            return Result<LoginResponse>.Unauthorized("Invalid email or password!");

        var accountStatus = CheckAccountStatus(user);
        if (accountStatus.IsFailure)
            return accountStatus;

        var signInResult = await VerifyPasswordAsync(user, request.Password);
        if (signInResult.IsFailure)
            return signInResult;

        await UpdateLastLoginAsync(user);

        return await GenerateSuccessResponseAsync(user);
    }

    private async Task<Result<LoginResponse>> ValidateRequestAsync(LoginCommand request, CancellationToken ct)
    {
        var validationResult = await validator.ValidateAsync(request, ct);

        return validationResult.IsValid
            ? Result<LoginResponse>.Success(null!)
            : Result<LoginResponse>.ValidationFailure(
                validationResult.Errors.Select(e => e.ErrorMessage).ToList());
    }

    private async Task<ApplicationUser?> FindUserAsync(string email) =>
        await userManager.FindByEmailAsync(email);

    private static Result<LoginResponse> CheckAccountStatus(ApplicationUser user) =>
        user.IsActive
            ? Result<LoginResponse>.Success(null!)
            : Result<LoginResponse>.Forbidden("Account has been deactivated.");

    private async Task<Result<LoginResponse>> VerifyPasswordAsync(ApplicationUser user, string password)
    {
        var result = await signInManager.CheckPasswordSignInAsync(
            user, password, lockoutOnFailure: true);

        if (result.IsLockedOut)
            return Result<LoginResponse>.Locked("Account locked due to multiple failed attempts.");

        return result.Succeeded
            ? Result<LoginResponse>.Success(null!)
            : Result<LoginResponse>.Unauthorized("Invalid email or password!");
    }

    private async Task UpdateLastLoginAsync(ApplicationUser user)
    {
        user.LastLoginAt = DateTime.UtcNow;
        await userManager.UpdateAsync(user);
    }

    private async Task<Result<LoginResponse>> GenerateSuccessResponseAsync(ApplicationUser user)
    {
        var tokens = await tokenService.GenerateTokensAsync(user);
        await UpdateRefreshTokenAsync(user, tokens.RefreshToken);

        var roles = await userManager.GetRolesAsync(user);
        var userDto = CreateUserDto(user, roles);

        var response = new LoginResponse
        {
            Token = tokens.AccessToken,
            RefreshToken = tokens.RefreshToken,
            User = userDto
        };

        return Result<LoginResponse>.Success(response);
    }

    private async Task UpdateRefreshTokenAsync(
        ApplicationUser user,
        string refreshToken)
    {
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(30);
        await userManager.UpdateAsync(user);
    }

    private static UserDto CreateUserDto(ApplicationUser user, IList<string> roles) => new()
    {
        Id = user.Id,
        Email = user.Email!,
        FullName = user.FullName,
        Roles = [.. roles],
        BusinessName = user.BusinessName
    };
}