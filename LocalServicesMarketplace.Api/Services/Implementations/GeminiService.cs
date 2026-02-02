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
            var response = await CallGeminiTextApiAsync(prompt, ct);
            return ParseServiceModerationResponse(response);
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

    public async Task<ImageModerationResult> ModerateImageAsync(
        byte[] imageBytes,
        string contentType,
        string providerCategory,
        CancellationToken ct = default)
    {
        if (!_isEnabled)
        {
            _logger.LogInformation("AI image moderation disabled, auto-approving image");
            return new ImageModerationResult
            {
                IsApproved = true,
                Reason = "AI moderation not configured - auto-approved",
                ConfidenceScore = 1.0,
                DetectedCategories = []
            };
        }

        try
        {
            var prompt = BuildImageModerationPrompt(providerCategory);
            var response = await CallGeminiVisionApiAsync(prompt, imageBytes, contentType, ct);
            return ParseImageModerationResponse(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Gemini Vision API for image moderation");
            return new ImageModerationResult
            {
                IsApproved = true,
                Reason = "AI image moderation temporarily unavailable - auto-approved for review",
                ConfidenceScore = 0.0,
                DetectedCategories = []
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

    private async Task<string> CallGeminiTextApiAsync(string prompt, CancellationToken ct)
    {
        var googleAi = new GoogleAI(_apiKey);
        var model = googleAi.GenerativeModel(Model.Gemini3Flash);

        var response = await model.GenerateContent(prompt, cancellationToken: ct);

        return response.Text ?? throw new InvalidOperationException("Empty response from Gemini API");
    }

    private ModerationResult ParseServiceModerationResponse(string apiResponse)
    {
        try
        {
            _logger.LogDebug("Gemini API response: {Response}", apiResponse);

            // Clean up the response (remove potential markdown formatting)
            var text = CleanJsonResponse(apiResponse);

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

    private static string BuildImageModerationPrompt(string providerCategory)
    {
        return """
            You are an image moderator for a local home services marketplace platform.
            
            The provider offers services in the category: "{providerCategory}"
            
            Analyze this portfolio image and determine if it should be APPROVED or REJECTED.
            
            REJECTION CRITERIA (reject if ANY apply):
            1. NSFW content (nudity, sexual content, pornography)
            2. Violence, gore, or disturbing imagery
            3. Hate symbols, offensive gestures, or discriminatory content
            4. Spam images (random memes, unrelated stock photos)
            5. Images of pets/animals that are not related to pet services
            6. Selfies or personal photos not showing work
            7. Screenshots of social media, text messages, or other apps
            8. Completely blurry or unrecognizable images
            9. Images with visible personal information (IDs, addresses, phone numbers)
            10. Advertising or promotional content for other businesses
            
            APPROVAL CRITERIA (approve if image shows ANY of these):
            1. Completed work projects (before/after photos)
            2. Tools, equipment, or materials related to home services
            3. Work in progress on homes, buildings, gardens, appliances
            4. Professional photos of: kitchens, bathrooms, plumbing, electrical work,
               painting, flooring, roofing, landscaping, cleaning results, HVAC systems,
               furniture assembly, home repairs, renovations, installations
            5. Workspaces, workshops, or service vehicles
            6. Team photos in work context (uniforms, job sites)
            
            Respond ONLY with a JSON object in this exact format (no markdown, no extra text):
            {"approved": true, "reason": "Brief explanation", "confidence": 0.95, "detected_categories": ["list", "of", "what", "you", "see"]}
            
            Examples:
            {"approved": true, "reason": "Shows completed bathroom renovation with new tiles and fixtures", "confidence": 0.95, "detected_categories": ["bathroom", "tiles", "renovation", "plumbing"]}
            {"approved": false, "reason": "Image shows a cat which is not relevant to home services", "confidence": 0.98, "detected_categories": ["cat", "pet", "animal"]}
            {"approved": false, "reason": "NSFW content detected - image contains nudity", "confidence": 0.99, "detected_categories": ["nsfw", "inappropriate"]}
            {"approved": true, "reason": "Professional photo of garden landscaping work", "confidence": 0.92, "detected_categories": ["garden", "landscaping", "outdoor", "plants"]}
            """
            .Replace("{providerCategory}", providerCategory);
    }

    private async Task<string> CallGeminiVisionApiAsync(
        string prompt,
        byte[] imageBytes,
        string contentType,
        CancellationToken ct)
    {
        var googleAi = new GoogleAI(_apiKey);
        var model = googleAi.GenerativeModel(Model.Gemini3Flash);

        // Convert image bytes to base64 for the API
        var base64Image = Convert.ToBase64String(imageBytes);

        // Create the request with image
        var request = new GenerateContentRequest
        {
            Contents =
            [
                new Content
                {
                    Role = "user",
                    Parts =
                    [
                        new Part { Text = prompt },
                        new Part
                        {
                            InlineData = new InlineData
                            {
                                MimeType = contentType,
                                Data = base64Image
                            }
                        }
                    ]
                }
            ],
            GenerationConfig = new GenerationConfig
            {
                Temperature = 0.1f,
                MaxOutputTokens = 1024
            }
        };

        var response = await model.GenerateContent(request, cancellationToken: ct);

        // Log the full response for debugging
        _logger.LogDebug("Gemini Vision full response: {@Response}", response);

        // Try to get text from different possible locations
        var text = response.Text;
        
        if (string.IsNullOrEmpty(text) && response.Candidates?.Count > 0)
        {
            var candidate = response.Candidates[0];
            if (candidate.Content?.Parts?.Count > 0)
            {
                text = candidate.Content.Parts[0].Text;
            }
            
            // Log if there's a finish reason that might indicate an issue
            _logger.LogDebug("Candidate finish reason: {FinishReason}", candidate.FinishReason);
        }

        if (string.IsNullOrEmpty(text))
        {
            _logger.LogWarning("Empty response from Gemini Vision API. Response object: {@Response}", response);
            throw new InvalidOperationException("Empty response from Gemini Vision API");
        }

        return text;
    }

    private ImageModerationResult ParseImageModerationResponse(string apiResponse)
    {
        try
        {
            _logger.LogDebug("Gemini Vision API response: {Response}", apiResponse);

            var text = CleanJsonResponse(apiResponse);
            using var doc = JsonDocument.Parse(text);
            var root = doc.RootElement;

            var detectedCategories = new List<string>();
            if (root.TryGetProperty("detected_categories", out var categoriesElement))
            {
                foreach (var category in categoriesElement.EnumerateArray())
                {
                    var cat = category.GetString();
                    if (!string.IsNullOrEmpty(cat))
                        detectedCategories.Add(cat);
                }
            }

            return new ImageModerationResult
            {
                IsApproved = root.GetProperty("approved").GetBoolean(),
                Reason = root.GetProperty("reason").GetString() ?? "No reason provided",
                ConfidenceScore = root.TryGetProperty("confidence", out var conf) ? conf.GetDouble() : 0.8,
                DetectedCategories = [.. detectedCategories]
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse Gemini Vision API response: {Response}", apiResponse);
            return new ImageModerationResult
            {
                IsApproved = true,
                Reason = "Could not parse AI response - auto-approved for manual review",
                ConfidenceScore = 0.0,
                DetectedCategories = []
            };
        }
    }

    private static string CleanJsonResponse(string response)
    {
        var text = response.Trim();

        if (text.StartsWith("```json"))
            text = text[7..];
        else if (text.StartsWith("```"))
            text = text[3..];

        if (text.EndsWith("```"))
            text = text[..^3];

        return text.Trim();
    }
}