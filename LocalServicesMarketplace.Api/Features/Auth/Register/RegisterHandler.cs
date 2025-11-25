using FluentValidation;
using LocalServicesMarketplace.Api.Features.Auth.Common;
using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Common;
using LocalServicesMarketplace.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Net;

namespace LocalServicesMarketplace.Api.Features.Auth.Register;

public class RegisterHandler(
    UserManager<ApplicationUser> userManager,
    ITokenService tokenService,
    IValidator<RegisterCommand> validator)
    : IRequestHandler<RegisterCommand, Result<RegisterResponse>>
{
    public async Task<Result<RegisterResponse>> Handle(RegisterCommand request, CancellationToken ct)
    {
        var validationResult = await ValidateRequestAsync(request, ct);
        if (validationResult.IsFailure)
            return validationResult;

        var existenceCheck = await CheckUserExistsAsync(request.Email);
        if (existenceCheck.IsFailure)
            return existenceCheck;

        var user = CreateUserEntity(request);

        var createResult = await CreateUserAsync(user, request.Password);
        if (createResult.IsFailure)
            return createResult;

        var roleResult = await AssignRoleAsync(user, request.Role);
        if (roleResult.IsFailure)
        {
            await RollbackUserCreationAsync(user);
            return roleResult;
        }

        return await GenerateSuccessResponseAsync(user);
    }

    private async Task<Result<RegisterResponse>> ValidateRequestAsync(RegisterCommand request, CancellationToken ct)
    {
        var validationResult = await validator.ValidateAsync(request, ct);

        return validationResult.IsValid
            ? Result<RegisterResponse>.Success(null!)
            : Result<RegisterResponse>.ValidationFailure(
                [.. validationResult.Errors.Select(e => e.ErrorMessage)]);
    }

    private async Task<Result<RegisterResponse>> CheckUserExistsAsync(string email)
    {
        var existingUser = await userManager.FindByEmailAsync(email);

        return existingUser != null
            ? Result<RegisterResponse>.Conflict("User with this email already exists!")
            : Result<RegisterResponse>.Success(null!);
    }

    private static ApplicationUser CreateUserEntity(RegisterCommand request) => new()
    {
        UserName = request.Email,
        Email = request.Email,
        FirstName = request.FirstName,
        LastName = request.LastName,
        CreatedAt = DateTime.UtcNow,
        BusinessName = request.BusinessName,
        BusinessDescription = request.BusinessDescription
    };

    private async Task<Result<RegisterResponse>> CreateUserAsync(ApplicationUser user, string password)
    {
        var createResult = await userManager.CreateAsync(user, password);

        return createResult.Succeeded
            ? Result<RegisterResponse>.Success(null!)
            : Result<RegisterResponse>.Failure(
                HttpStatusCode.BadRequest,
                [.. createResult.Errors.Select(e => e.Description)]);
    }

    private async Task<Result<RegisterResponse>> AssignRoleAsync(ApplicationUser user, string role)
    {
        var roleResult = await userManager.AddToRoleAsync(user, role);

        return roleResult.Succeeded
            ? Result<RegisterResponse>.Success(null!)
            : Result<RegisterResponse>.Failure(
                HttpStatusCode.InternalServerError,
                "Failed to assign role.");
    }

    private async Task RollbackUserCreationAsync(ApplicationUser user) =>
        await userManager.DeleteAsync(user);

    private async Task<Result<RegisterResponse>> GenerateSuccessResponseAsync(ApplicationUser user)
    {
        var tokens = await tokenService.GenerateTokensAsync(user);
        await UpdateUserWithRefreshTokenAsync(user, tokens.RefreshToken);

        var roles = await userManager.GetRolesAsync(user);
        var userDto = CreateUserDto(user, roles);

        var response = new RegisterResponse
        {
            Token = tokens.AccessToken,
            RefreshToken = tokens.RefreshToken,
            User = userDto
        };

        return Result<RegisterResponse>.Success(response, HttpStatusCode.Created);
    }

    private async Task UpdateUserWithRefreshTokenAsync(ApplicationUser user, string refreshToken)
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