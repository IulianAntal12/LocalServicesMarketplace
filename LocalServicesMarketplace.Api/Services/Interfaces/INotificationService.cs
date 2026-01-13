using LocalServicesMarketplace.Core.Entities;

namespace LocalServicesMarketplace.Api.Services.Interfaces;

public interface INotificationService
{
    Task CreateAsync(string userId, string title, string message, NotificationType type, int? bookingId = null);
    Task SendBookingNotificationAsync(Booking booking, NotificationType type);
    Task SendEmailNotificationAsync(string email, string subject, string body);
}