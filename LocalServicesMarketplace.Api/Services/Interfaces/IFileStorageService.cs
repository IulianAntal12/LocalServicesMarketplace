namespace LocalServicesMarketplace.Api.Services.Interfaces;

public interface IFileStorageService
{
    Task<string> UploadImageAsync(IFormFile file, string providerId);
    Task DeleteImageAsync(string filePath);
    bool ValidateImage(IFormFile file);
}
