namespace LocalServicesMarketplace.Api.Services.Interfaces;

public interface IGeminiService
{
    Task<ModerationResult> ModerateServiceAsync(string serviceName, string description, string category, decimal price, CancellationToken ct = default);
    Task<ImageModerationResult> ModerateImageAsync(byte[] imageBytes, string contentType, string providerCategory, CancellationToken ct = default);
}

public class ModerationResult
{
    public bool IsApproved { get; set; }
    public string Reason { get; set; } = string.Empty;
    public double ConfidenceScore { get; set; }
}

public class ImageModerationResult
{
    public bool IsApproved { get; set; }
    public string Reason { get; set; } = string.Empty;
    public double ConfidenceScore { get; set; }
    public string[] DetectedCategories { get; set; } = [];
}






