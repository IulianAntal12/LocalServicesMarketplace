using LocalServicesMarketplace.Api.Services.Interfaces;
using Mscc.GenerativeAI;
using Mscc.GenerativeAI.Types;
using System.Text.Json;

namespace LocalServicesMarketplace.Api.Services.Implementations;

public class GeminiService : IGeminiService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<GeminiService> _logger;
    private readonly string _apiKey;
    private readonly bool _isEnabled;

    public GeminiService(
        IConfiguration configuration,
        ILogger<GeminiService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _apiKey = _configuration["Gemini:ApiKey"] ?? string.Empty;
        _isEnabled = !string.IsNullOrEmpty(_apiKey);

        if (!_isEnabled)
        {
            _logger.LogWarning("Gemini API key not configured. AI moderation will auto-approve all services.");
        }
    }

    public async Task<ModerationResult> ModerateServiceAsync(
        string serviceName,
        string description,
        string category,
        decimal price,
        CancellationToken ct = default)
    {
        if (!_isEnabled)
        {
            _logger.LogInformation("AI moderation disabled, auto-approving service: {ServiceName}", serviceName);
            return new ModerationResult
            {
                IsApproved = true,
                Reason = "AI moderation not configured - auto-approved",
                ConfidenceScore = 1.0
            };
        }

        try
        {
            var prompt = BuildModerationPrompt(serviceName, description, category, price);
            var response = await CallGeminiApiAsync(prompt, ct);
            return ParseModerationResponse(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Gemini API for service moderation. Auto-approving service: {ServiceName}", serviceName);

            // On error, auto-approve to not block the user (fail-open)
            return new ModerationResult
            {
                IsApproved = true,
                Reason = "AI moderation temporarily unavailable - auto-approved for review",
                ConfidenceScore = 0.0
            };
        }
    }

    private static string BuildModerationPrompt(string serviceName, string description, string category, decimal price)
    {
        return """
            You are a content moderator for a local services marketplace platform (like Fiverr for home services).

            Analyze the following service listing and determine if it should be APPROVED or REJECTED.

            SERVICE DETAILS:
            - Name: {serviceName}
            - Description: {description}
            - Category: {category}
            - Price: {price} RON

            REJECTION CRITERIA (reject if ANY apply):
            1. Spam or gibberish text
            2. Inappropriate, offensive, or discriminatory content
            3. Illegal services or activities
            4. Misleading or fraudulent claims
            5. Contact information in description (phone, email, website) - should use platform messaging
            6. Price seems unrealistic for the service type (e.g., 1 RON for major plumbing work)
            7. Description doesn't match the category
            8. Adult or explicit content

            APPROVAL CRITERIA:
            - Clear, professional description of a legitimate home service
            - Reasonable pricing for the service type
            - Category matches the service offered
            - No policy violations

            Respond ONLY with a JSON object in this exact format (no markdown, no extra text):
            {"approved": true, "reason": "Brief explanation in Romanian", "confidence": 0.95}

            Examples:
            {"approved": true, "reason": "Serviciu legitim de instalații sanitare cu descriere clară și preț rezonabil.", "confidence": 0.95}
            {"approved": false, "reason": "Descrierea conține informații de contact (număr de telefon), ceea ce încalcă regulamentul platformei.", "confidence": 0.92}
            """
            .Replace("{serviceName}", serviceName)
            .Replace("{description}", description)
            .Replace("{category}", category)
            .Replace("{price}", price.ToString());
    }

    private async Task<string> CallGeminiApiAsync(string prompt, CancellationToken ct)
    {
        var googleAi = new GoogleAI(_apiKey);
        var model = googleAi.GenerativeModel(Model.Gemini3Flash);

        var response = await model.GenerateContent(prompt, cancellationToken: ct);

        return response.Text ?? throw new InvalidOperationException("Empty response from Gemini API");
    }

    private ModerationResult ParseModerationResponse(string apiResponse)
    {
        try
        {
            _logger.LogDebug("Gemini API response: {Response}", apiResponse);

            // Clean up the response (remove potential markdown formatting)
            var text = apiResponse.Trim();
            if (text.StartsWith("```json"))
            {
                text = text[7..];
            }
            if (text.StartsWith("```"))
            {
                text = text[3..];
            }
            if (text.EndsWith("```"))
            {
                text = text[..^3];
            }
            text = text.Trim();

            // Parse the JSON response
            using var doc = JsonDocument.Parse(text);
            var root = doc.RootElement;

            return new ModerationResult
            {
                IsApproved = root.GetProperty("approved").GetBoolean(),
                Reason = root.GetProperty("reason").GetString() ?? "No reason provided",
                ConfidenceScore = root.TryGetProperty("confidence", out var conf)
                    ? conf.GetDouble()
                    : 0.8
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse Gemini API response: {Response}", apiResponse);

            // Default to approval on parse error
            return new ModerationResult
            {
                IsApproved = true,
                Reason = "Could not parse AI response - auto-approved for manual review",
                ConfidenceScore = 0.0
            };
        }
    }
}