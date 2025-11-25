namespace LocalServicesMarketplace.Api.Services.Implementations;

using LocalServicesMarketplace.Api.Services.Interfaces;

public class LocalFileStorageService(IWebHostEnvironment environment) : IFileStorageService
{
    private readonly IWebHostEnvironment _environment = environment;
    private readonly string[] _allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

    public async Task<string> UploadImageAsync(IFormFile file, string providerId)
    {
        if (!ValidateImage(file))
            throw new InvalidOperationException("Invalid image file!");

        // Create directory structure
        var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "portfolios", providerId);
        Directory.CreateDirectory(uploadsFolder);

        // Generate unique filename
        var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        // Save file
        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        // Return relative path for database
        return $"uploads/portfolios/{providerId}/{uniqueFileName}";
    }

    public Task DeleteImageAsync(string filePath)
    {
        var fullPath = Path.Combine(_environment.WebRootPath, filePath);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
        return Task.CompletedTask;
    }

    public bool ValidateImage(IFormFile file)
    {
        if (file.Length == 0 || file.Length > MaxFileSize)
            return false;

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        return _allowedExtensions.Contains(extension);
    }
}