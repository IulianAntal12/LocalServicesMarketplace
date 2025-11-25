namespace LocalServicesMarketplace.Api.Features.SharedDTOs;

public class ServiceDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string Category { get; set; }
    public decimal BasePrice { get; set; }
    public string PriceType { get; set; } = "Hourly";
    public int EstimatedDurationMinutes { get; set; }
    public bool IsActive { get; set; }
}