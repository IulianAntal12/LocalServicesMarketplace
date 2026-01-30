using LocalServicesMarketplace.Api.Services.Interfaces;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.GridFS;

namespace LocalServicesMarketplace.Api.Services.Implementations;

public class MongoStorageService : IMongoStorageService
{
    private readonly GridFSBucket _gridFS;
    private readonly ILogger<MongoStorageService> _logger;
    private readonly string[] _allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

    public MongoStorageService(IConfiguration configuration, ILogger<MongoStorageService> logger)
    {
        _logger = logger;

        var connectionString = configuration["MongoDB:ConnectionString"]
            ?? throw new InvalidOperationException("MongoDB connection string not configured!");

        var databaseName = configuration["MongoDB:DatabaseName"] ?? "LocalServicesMarketplace";

        var client = new MongoClient(connectionString);
        var database = client.GetDatabase(databaseName);

        _gridFS = new GridFSBucket(database, new GridFSBucketOptions
        {
            BucketName = "portfolioImages",
            ChunkSizeBytes = 255 * 1024 // 255KB chunks
        });

        _logger.LogInformation("MongoDB GridFS initialized for database: {DatabaseName}", databaseName);
    }

    public async Task<string> UploadImageAsync(IFormFile file, string providerId)
    {
        if (!ValidateImage(file))
            throw new InvalidOperationException("Invalid image file!");

        try
        {
            using var stream = file.OpenReadStream();

            var options = new GridFSUploadOptions
            {
                Metadata = new BsonDocument
                {
                    { "providerId", providerId },
                    { "originalFileName", file.FileName },
                    { "contentType", file.ContentType ?? "image/jpeg" },
                    { "uploadedAt", DateTime.UtcNow },
                    { "fileSize", file.Length }
                }
            };

            var uniqueFileName = $"{providerId}/{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var objectId = await _gridFS.UploadFromStreamAsync(uniqueFileName, stream, options);

            _logger.LogInformation("Image uploaded to MongoDB GridFS. ObjectId: {ObjectId}, Provider: {ProviderId}",
                objectId.ToString(), providerId);

            return objectId.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload image to MongoDB GridFS for provider {ProviderId}", providerId);
            throw;
        }
    }

    public async Task DeleteImageAsync(string fileId)
    {
        try
        {
            if (!ObjectId.TryParse(fileId, out var objectId))
            {
                _logger.LogWarning("Invalid ObjectId format: {FileId}", fileId);
                return;
            }

            await _gridFS.DeleteAsync(objectId);
            _logger.LogInformation("Image deleted from MongoDB GridFS. ObjectId: {ObjectId}", fileId);
        }
        catch (GridFSFileNotFoundException)
        {
            _logger.LogWarning("Image not found in MongoDB GridFS. ObjectId: {FileId}", fileId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete image from MongoDB GridFS. ObjectId: {FileId}", fileId);
            throw;
        }
    }

    public async Task<(byte[] Content, string ContentType)?> GetImageAsync(string fileId)
    {
        try
        {
            if (!ObjectId.TryParse(fileId, out var objectId))
            {
                _logger.LogWarning("Invalid ObjectId format: {FileId}", fileId);
                return null;
            }

            // Get file info for content type
            var filter = Builders<GridFSFileInfo>.Filter.Eq("_id", objectId);
            var fileInfo = await _gridFS.Find(filter).FirstOrDefaultAsync();

            if (fileInfo == null)
            {
                _logger.LogWarning("Image not found in MongoDB GridFS. ObjectId: {FileId}", fileId);
                return null;
            }

            var contentType = fileInfo.Metadata?.GetValue("contentType", "image/jpeg").AsString ?? "image/jpeg";

            // Download file content
            var content = await _gridFS.DownloadAsBytesAsync(objectId);

            return (content, contentType);
        }
        catch (GridFSFileNotFoundException)
        {
            _logger.LogWarning("Image not found in MongoDB GridFS. ObjectId: {FileId}", fileId);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get image from MongoDB GridFS. ObjectId: {FileId}", fileId);
            throw;
        }
    }

    public bool ValidateImage(IFormFile file)
    {
        if (file.Length == 0 || file.Length > MaxFileSize)
            return false;

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        return _allowedExtensions.Contains(extension);
    }
}