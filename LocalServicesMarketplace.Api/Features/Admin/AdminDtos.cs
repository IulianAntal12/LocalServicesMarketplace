namespace LocalServicesMarketplace.Api.Features.Admin;

public class ServiceModerationDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public string PriceType { get; set; } = string.Empty;
    public string ModerationStatus { get; set; } = string.Empty;
    public string? ModerationReason { get; set; }
    public DateTime? ModeratedAt { get; set; }
    public string? ModeratedBy { get; set; }
    public DateTime CreatedAt { get; set; }

    // Provider info
    public string ProviderId { get; set; } = string.Empty;
    public string ProviderName { get; set; } = string.Empty;
    public string? ProviderBusinessName { get; set; }
    public string ProviderEmail { get; set; } = string.Empty;
}

public class GetServicesResponse
{
    public List<ServiceModerationDto> Services { get; set; } = [];
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}

public class ModerateServiceResponse
{
    public int ServiceId { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class DashboardStatsDto
{
    public int TotalServices { get; set; }
    public int PendingServices { get; set; }
    public int AiRejectedServices { get; set; }
    public int ApprovedServices { get; set; }
    public int AdminRejectedServices { get; set; }
    public int TotalProviders { get; set; }
    public int TotalCustomers { get; set; }
    public int TotalBookings { get; set; }
    public int TotalReviews { get; set; }
    public List<RecentModerationDto> RecentModerations { get; set; } = [];
}

public class RecentModerationDto
{
    public int ServiceId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public string OldStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string? ModeratorName { get; set; }
    public DateTime CreatedAt { get; set; }
}