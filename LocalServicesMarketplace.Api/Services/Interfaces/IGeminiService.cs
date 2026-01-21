namespace LocalServicesMarketplace.Api.Services.Interfaces;

public interface IGeminiService
{
    Task<ModerationResult> ModerateServiceAsync(
        string serviceName,
        string description,
        string category,
        decimal price,
        CancellationToken ct = default);
}

public class ModerationResult
{
    public bool IsApproved { get; set; }
    public string Reason { get; set; } = string.Empty;
    public double ConfidenceScore { get; set; }
}