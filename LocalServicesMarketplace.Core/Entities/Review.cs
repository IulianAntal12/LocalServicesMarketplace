namespace LocalServicesMarketplace.Core.Entities;

public class Review
{
    public int Id { get; set; }
    public required string CustomerId { get; set; }
    public required string ProviderId { get; set; }
    public int? ServiceId { get; set; }
    public int Rating { get; set; }
    public required string Title { get; set; }
    public required string Comment { get; set; }
    public string? ProviderResponse { get; set; }
    public DateTime? ProviderResponseAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsVerified { get; set; }
    public bool IsVisible { get; set; } = true;

    // Navigation properties
    public ApplicationUser Customer { get; set; } = null!;
    public ApplicationUser Provider { get; set; } = null!;
    public Service? Service { get; set; }
}