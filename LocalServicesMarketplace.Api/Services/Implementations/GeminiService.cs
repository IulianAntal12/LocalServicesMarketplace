using LocalServicesMarketplace.Api.Services.Interfaces;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace LocalServicesMarketplace.Api.Services.Implementations;

public class GeminiService : IGeminiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GeminiService> _logger;
    private readonly string _apiKey;
    private readonly bool _isEnabled;

    private const string GeminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    public GeminiService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<GeminiService> logger)
    {
        _httpClient = httpClient;
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
        return
            "You are a content moderator for a local services marketplace platform (like Fiverr for home services).\n" +
            "\n" +
            "Analyze the following service listing and determine if it should be APPROVED or REJECTED.\n" +
            "\n" +
            "SERVICE DETAILS:\n" +
            $"- Name: {serviceName}\n" +
            $"- Description: {description}\n" +
            $"- Category: {category}\n" +
            $"- Price: {price} RON\n" +
            "\n" +
            "REJECTION CRITERIA (reject if ANY apply):\n" +
            "1. Spam or gibberish text\n" +
            "2. Inappropriate, offensive, or discriminatory content\n" +
            "3. Illegal services or activities\n" +
            "4. Misleading or fraudulent claims\n" +
            "5. Contact information in description (phone, email, website) - should use platform messaging\n" +
            "6. Price seems unrealistic for the service type (e.g., 1 RON for major plumbing work)\n" +
            "7. Description doesn't match the category\n" +
            "8. Adult or explicit content\n" +
            "\n" +
            "APPROVAL CRITERIA:\n" +
            "- Clear, professional description of a legitimate home service\n" +
            "- Reasonable pricing for the service type\n" +
            "- Category matches the service offered\n" +
            "- No policy violations\n" +
            "\n" +
            "Respond ONLY with a JSON object in this exact format (no markdown, no extra text):\n" +
            "{\"approved\": true/false, \"reason\": \"Brief explanation in Romanian\", \"confidence\": 0.0-1.0}\n" +
            "\n" +
            "Examples:\n" +
            "{\"approved\": true, \"reason\": \"Serviciu legitim de instalații sanitare cu descriere clară și preț rezonabil.\", \"confidence\": 0.95}\n" +
            "{\"approved\": false, \"reason\": \"Descrierea conține informații de contact (număr de telefon), ceea ce încalcă regulamentul platformei.\", \"confidence\": 0.92}\n";
    }

    private async Task<string> CallGeminiApiAsync(string prompt, CancellationToken ct)
    {
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.1, // Low temperature for consistent responses
                maxOutputTokens = 256
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var requestUrl = $"{GeminiApiUrl}?key={_apiKey}";

        var response = await _httpClient.PostAsync(requestUrl, content, ct);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsStringAsync(ct);
    }

    private ModerationResult ParseModerationResponse(string apiResponse)
    {
        try
        {
            using var doc = JsonDocument.Parse(apiResponse);
            var root = doc.RootElement;

            // Navigate to the text content in Gemini's response structure
            var text = root
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrEmpty(text))
            {
                throw new InvalidOperationException("Empty response from Gemini API");
            }

            // Clean up the response (remove potential markdown formatting)
            text = text.Trim();
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
            using var resultDoc = JsonDocument.Parse(text);
            var resultRoot = resultDoc.RootElement;

            return new ModerationResult
            {
                IsApproved = resultRoot.GetProperty("approved").GetBoolean(),
                Reason = resultRoot.GetProperty("reason").GetString() ?? "No reason provided",
                ConfidenceScore = resultRoot.TryGetProperty("confidence", out var conf)
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