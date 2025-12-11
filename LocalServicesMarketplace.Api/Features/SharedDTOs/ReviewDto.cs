namespace LocalServicesMarketplace.Api.Features.SharedDTOs;

public class ReviewDto
{
    public int Id { get; set; }
    public required string CustomerId { get; set; }
    public required string CustomerName { get; set; }
    public required string ProviderId { get; set; }
    public int? ServiceId { get; set; }
    public string? ServiceName { get; set; }
    public int Rating { get; set; }
    public required string Title { get; set; }
    public required string Comment { get; set; }
    public string? ProviderResponse { get; set; }
    public DateTime? ProviderResponseAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsVerified { get; set; }
}