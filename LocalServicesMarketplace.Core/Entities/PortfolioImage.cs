namespace LocalServicesMarketplace.Core.Entities;

public class PortfolioImage
{
    public int Id { get; set; }
    public required string ProviderId { get; set; }
    public required string FileName { get; set; }
    public required string FilePath { get; set; }
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public long FileSizeBytes { get; set; }
    public string ContentType { get; set; } = "image/jpeg";

    public ApplicationUser Provider { get; set; } = null!;
}
