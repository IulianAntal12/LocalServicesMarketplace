namespace LocalServicesMarketplace.Api.Services.Interfaces;

public interface IMongoStorageService
{
    Task<string> UploadImageAsync(IFormFile file, string providerId);
    Task DeleteImageAsync(string fileId);
    Task<(byte[] Content, string ContentType)?> GetImageAsync(string fileId);
    bool ValidateImage(IFormFile file);
}