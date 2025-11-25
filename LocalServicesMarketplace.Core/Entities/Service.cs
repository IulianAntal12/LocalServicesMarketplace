namespace LocalServicesMarketplace.Core.Entities;

public class Service
{
    public int Id { get; set; }
    public required string ProviderId { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string Category { get; set; }
    public decimal BasePrice { get; set; }
    public string PriceType { get; set; } = "Hourly"; // Hourly, Fixed, Quote
    public int EstimatedDurationMinutes { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation
    public ApplicationUser Provider { get; set; } = null!;
}
