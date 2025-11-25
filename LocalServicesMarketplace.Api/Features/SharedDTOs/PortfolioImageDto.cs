namespace LocalServicesMarketplace.Api.Features.SharedDTOs;

public class PortfolioImageDto
{
    public int Id { get; set; }
    public required string ImageUrl { get; set; }
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime UploadedAt { get; set; }
}

