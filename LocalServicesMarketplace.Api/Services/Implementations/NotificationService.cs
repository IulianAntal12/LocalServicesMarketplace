using LocalServicesMarketplace.Api.Services.Interfaces;
using LocalServicesMarketplace.Core.Entities;
using LocalServicesMarketplace.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Mail;

namespace LocalServicesMarketplace.Api.Services.Implementations;

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        ApplicationDbContext context,
        IConfiguration configuration,
        ILogger<NotificationService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task CreateAsync(
        string userId,
        string title,
        string message,
        NotificationType type,
        int? bookingId = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            BookingId = bookingId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        // Try to send email notification
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user?.Email != null)
            {
                await SendEmailNotificationAsync(user.Email, title, message);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send email notification to user {UserId}", userId);
        }
    }

    public async Task SendBookingNotificationAsync(Booking booking, NotificationType type)
    {
        // Load related data if not loaded
        if (booking.Customer == null || booking.Provider == null || booking.Service == null)
        {
            booking = await _context.Set<Booking>()
                .Include(b => b.Customer)
                .Include(b => b.Provider)
                .Include(b => b.Service)
                .FirstAsync(b => b.Id == booking.Id);
        }

        var (recipientId, title, message) = type switch
        {
            NotificationType.BookingCreated => (
                booking.ProviderId,
                "Programare nouă",
                $"{booking.Customer.FullName} a solicitat o programare pentru {booking.Service.Name} pe {booking.ScheduledDate:dd MMM yyyy} la {booking.ScheduledTime:hh\\:mm}."
            ),
            NotificationType.BookingConfirmed => (
                booking.CustomerId,
                "Programare confirmată",
                $"{booking.Provider.BusinessName ?? booking.Provider.FullName} a confirmat programarea pentru {booking.Service.Name} pe {booking.ScheduledDate:dd MMM yyyy} la {booking.ScheduledTime:hh\\:mm}."
            ),
            NotificationType.BookingRejected => (
                booking.CustomerId,
                "Programare respinsă",
                $"{booking.Provider.BusinessName ?? booking.Provider.FullName} a respins programarea pentru {booking.Service.Name}."
            ),
            NotificationType.BookingStarted => (
                booking.CustomerId,
                "Lucrul a început",
                $"{booking.Provider.BusinessName ?? booking.Provider.FullName} a început lucrul pentru {booking.Service.Name}."
            ),
            NotificationType.BookingCompleted => (
                booking.CustomerId,
                "Serviciu finalizat",
                $"{booking.Provider.BusinessName ?? booking.Provider.FullName} a finalizat {booking.Service.Name}. Lasă o recenzie!"
            ),
            NotificationType.BookingCancelled => (
                booking.ProviderId,
                "Programare anulată",
                $"{booking.Customer.FullName} a anulat programarea pentru {booking.Service.Name} din {booking.ScheduledDate:dd MMM yyyy}."
            ),
            _ => throw new ArgumentException($"Unknown notification type: {type}")
        };

        await CreateAsync(recipientId, title, message, type, booking.Id);
    }

    public async Task SendEmailNotificationAsync(string email, string subject, string body)
    {
        var smtpSettings = _configuration.GetSection("Smtp");
        var host = smtpSettings["Host"];
        var port = int.Parse(smtpSettings["Port"] ?? "587");
        var username = smtpSettings["Username"];
        var password = smtpSettings["Password"];
        var fromEmail = smtpSettings["FromEmail"];
        var fromName = smtpSettings["FromName"] ?? "LocalPro";

        if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(username))
        {
            _logger.LogWarning("SMTP not configured, skipping email notification");
            return;
        }

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(fromEmail ?? username, fromName),
            Subject = subject,
            Body = BuildEmailBody(subject, body),
            IsBodyHtml = true
        };
        mailMessage.To.Add(email);

        await client.SendMailAsync(mailMessage);
        _logger.LogInformation("Email notification sent to {Email}", email);
    }

    private static string BuildEmailBody(string title, string message)
    {
        return $@"
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1 style='margin:0;'>LocalPro</h1>
                </div>
                <div class='content'>
                    <h2>{title}</h2>
                    <p>{message}</p>
                </div>
                <div class='footer'>
                    <p>© {DateTime.Now.Year} LocalPro. Toate drepturile rezervate.</p>
                </div>
            </div>
        </body>
        </html>";
    }
}
