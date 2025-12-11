using LocalServicesMarketplace.Core.Constants;
using LocalServicesMarketplace.Core.Entities;
using Microsoft.AspNetCore.Identity;

namespace LocalServicesMarketplace.Infrastructure.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        await context.Database.EnsureCreatedAsync();

        // Seed Roles
        await SeedRolesAsync(roleManager);

        // Seed Users
        await SeedUsersAsync(userManager);
    }

    private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
    {
        foreach (var roleName in Roles.AllRoles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }
    }

    private static async Task SeedUsersAsync(UserManager<ApplicationUser> userManager)
    {
        // Admin User
        if (await userManager.FindByEmailAsync("admin@localservices.com") == null)
        {
            var adminUser = new ApplicationUser
            {
                UserName = "admin@localservices.com",
                Email = "admin@localservices.com",
                FirstName = "Admin",
                LastName = "User",
                EmailConfirmed = true,
                IsActive = true
            };

            await userManager.CreateAsync(adminUser, "Admin123!");
            await userManager.AddToRoleAsync(adminUser, Roles.Admin);
        }

        // Test Providers
        if (await userManager.FindByEmailAsync("provider1@example.com") == null)
        {
            var providerUser = new ApplicationUser
            {
                UserName = "provider1@example.com",
                Email = "provider1@example.com",
                FirstName = "John",
                LastName = "Doe",
                BusinessName = "John's Plumbing Services",
                BusinessDescription = "Professional plumbing services with 10+ years experience",
                HourlyRate = 75.00m,
                ServiceAreas = ["Downtown", "Northside", "Westend"],
                Rating = 4.5,
                TotalReviews = 23,
                Address = "123 Main St",
                City = "Springfield",
                PostalCode = "12345",
                Latitude = 39.7817,
                Longitude = -89.6501,
                ServiceRadiusKm = 30,
                EmailConfirmed = true,
                IsActive = true
            };

            await userManager.CreateAsync(providerUser, "Provider123!");
            await userManager.AddToRoleAsync(providerUser, Roles.Provider);
        }

        if (await userManager.FindByEmailAsync("provider2@example.com") == null)
        {
            var electricianUser = new ApplicationUser
            {
                UserName = "provider2@example.com",
                Email = "provider2@example.com",
                FirstName = "Mike",
                LastName = "Johnson",
                BusinessName = "Lightning Fast Electrical",
                BusinessDescription = "Licensed electrician for residential and commercial properties",
                HourlyRate = 85.00m,
                ServiceAreas = ["Downtown", "Eastside", "Suburbs"],
                Rating = 4.8,
                TotalReviews = 45,
                Address = "789 Electric Blvd",
                City = "Springfield",
                PostalCode = "12347",
                Latitude = 39.7900,
                Longitude = -89.6440,
                ServiceRadiusKm = 25,
                EmailConfirmed = true,
                IsActive = true
            };

            await userManager.CreateAsync(electricianUser, "Provider123!");
            await userManager.AddToRoleAsync(electricianUser, Roles.Provider);
        }

        // Test Customer
        if (await userManager.FindByEmailAsync("jane.doe@example.com") == null)
        {
            var customerUser = new ApplicationUser
            {
                UserName = "jane.doe@example.com",
                Email = "jane.doe@example.com",
                FirstName = "Jane",
                LastName = "Doe",
                Address = "456 Oak Ave",
                City = "Springfield",
                PostalCode = "12346",
                EmailConfirmed = true,
                IsActive = true
            };

            await userManager.CreateAsync(customerUser, "Customer123!");
            await userManager.AddToRoleAsync(customerUser, Roles.Customer);
        }
    }
}