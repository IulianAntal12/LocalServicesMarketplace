using Microsoft.AspNetCore.Identity;

namespace LocalServicesMarketplace.Core.Entities;

public class ApplicationUser : IdentityUser
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;

    // Provider-specific properties
    public string? BusinessName { get; set; }
    public string? BusinessDescription { get; set; }
    public decimal? HourlyRate { get; set; }
    public List<string> ServiceAreas { get; set; } = [];
    public double? Rating { get; set; }
    public int TotalReviews { get; set; }

    // Profile
    public string? ProfilePictureUrl { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }

    // Security
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    public string FullName => $"{FirstName} {LastName}".Trim();

    public List<Service> Services { get; set; } = [];
    public List<PortfolioImage> PortfolioImages { get; set; } = [];
}