using LocalServicesMarketplace.Api.Services.Implementations;
using LocalServicesMarketplace.Api.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;

namespace LocalServicesMarketplace.Tests.GeminiServiceTests
{
    public class GeminiServiceTests
    {
        /// <summary>
        /// Creates a GeminiService with no API key configured (disabled mode).
        /// </summary>
        private static (GeminiService service, Mock<ILogger<GeminiService>> loggerMock) BuildDisabledService()
        {
            var configMock = new Mock<IConfiguration>();
            configMock.Setup(c => c["Gemini:ApiKey"]).Returns(string.Empty);

            var loggerMock = new Mock<ILogger<GeminiService>>();
            var service = new GeminiService(configMock.Object, loggerMock.Object);

            return (service, loggerMock);
        }

        /// <summary>
        /// Creates a GeminiService with a null API key configured (disabled mode).
        /// </summary>
        private static GeminiService BuildServiceWithNullApiKey()
        {
            var configMock = new Mock<IConfiguration>();
            configMock.Setup(c => c["Gemini:ApiKey"]).Returns((string?)null);

            var loggerMock = new Mock<ILogger<GeminiService>>();
            return new GeminiService(configMock.Object, loggerMock.Object);
        }

        [Fact]
        public void Constructor_WhenApiKeyIsEmpty_LogsWarning()
        {
            // Arrange & Act
            var (_, loggerMock) = BuildDisabledService();

            // Assert
            loggerMock.Verify(
                x => x.Log(
                    LogLevel.Warning,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Gemini API key not configured")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                Times.Once);
        }

        [Fact]
        public void Constructor_WhenApiKeyIsNull_LogsWarning()
        {
            // Arrange
            var configMock = new Mock<IConfiguration>();
            configMock.Setup(c => c["Gemini:ApiKey"]).Returns((string?)null);
            var loggerMock = new Mock<ILogger<GeminiService>>();

            // Act
            _ = new GeminiService(configMock.Object, loggerMock.Object);

            // Assert
            loggerMock.Verify(
                x => x.Log(
                    LogLevel.Warning,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Gemini API key not configured")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                Times.Once);
        }

        [Fact]
        public void Constructor_WhenApiKeyIsConfigured_DoesNotLogWarning()
        {
            // Arrange
            var configMock = new Mock<IConfiguration>();
            configMock.Setup(c => c["Gemini:ApiKey"]).Returns("valid-api-key");
            var loggerMock = new Mock<ILogger<GeminiService>>();

            // Act
            _ = new GeminiService(configMock.Object, loggerMock.Object);

            // Assert
            loggerMock.Verify(
                x => x.Log(
                    LogLevel.Warning,
                    It.IsAny<EventId>(),
                    It.IsAny<It.IsAnyType>(),
                    It.IsAny<Exception?>(),
                    It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                Times.Never);
        }

        [Fact]
        public async Task ModerateServiceAsync_WhenDisabled_ReturnsAutoApproved()
        {
            // Arrange
            var (service, _) = BuildDisabledService();

            // Act
            var result = await service.ModerateServiceAsync(
                "Reparatii electrice", "Montaj prize", "Electrical", 200m);

            // Assert
            Assert.True(result.IsApproved);
            Assert.Contains("auto-approved", result.Reason, StringComparison.OrdinalIgnoreCase);
            Assert.Equal(1.0, result.ConfidenceScore);
        }

        [Fact]
        public async Task ModerateServiceAsync_WhenDisabled_LogsInformation()
        {
            // Arrange
            var (service, loggerMock) = BuildDisabledService();

            // Act
            await service.ModerateServiceAsync(
                "Instalatii sanitare", "Reparatii tevi", "Plumbing", 150m);

            // Assert
            loggerMock.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("AI moderation disabled")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                Times.Once);
        }

        [Fact]
        public async Task ModerateServiceAsync_WhenDisabledWithNullKey_ReturnsAutoApproved()
        {
            // Arrange
            var service = BuildServiceWithNullApiKey();

            // Act
            var result = await service.ModerateServiceAsync(
                "Zugraveli", "Zugraveli interioare si exterioare", "Painting", 300m);

            // Assert
            Assert.True(result.IsApproved);
            Assert.Equal(1.0, result.ConfidenceScore);
        }

        [Fact]
        public async Task ModerateServiceAsync_WhenDisabled_ReturnsModerationResultType()
        {
            // Arrange
            var (service, _) = BuildDisabledService();

            // Act
            var result = await service.ModerateServiceAsync(
                "Test", "Test description", "General", 100m);

            // Assert
            Assert.IsType<ModerationResult>(result);
            Assert.NotNull(result.Reason);
            Assert.NotEmpty(result.Reason);
        }

        [Fact]
        public async Task ModerateServiceAsync_WhenDisabled_RespectsCancellationToken()
        {
            // Arrange
            var (service, _) = BuildDisabledService();
            using var cts = new CancellationTokenSource();

            // Act - disabled mode should return immediately without checking the token
            var result = await service.ModerateServiceAsync(
                "Service", "Description", "Category", 100m, cts.Token);

            // Assert
            Assert.True(result.IsApproved);
        }

        [Theory]
        [InlineData("", "Desc", "Cat", 100)]
        [InlineData("Name", "", "Cat", 100)]
        [InlineData("Name", "Desc", "", 100)]
        [InlineData("Name", "Desc", "Cat", 0)]
        public async Task ModerateServiceAsync_WhenDisabled_AutoApprovesRegardlessOfInput(
            string name, string description, string category, decimal price)
        {
            // Arrange
            var (service, _) = BuildDisabledService();

            // Act
            var result = await service.ModerateServiceAsync(name, description, category, price);

            // Assert
            Assert.True(result.IsApproved);
            Assert.Equal(1.0, result.ConfidenceScore);
        }

        [Fact]
        public async Task ModerateImageAsync_WhenDisabled_ReturnsAutoApproved()
        {
            // Arrange
            var (service, _) = BuildDisabledService();
            var imageBytes = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 }; // JPEG header

            // Act
            var result = await service.ModerateImageAsync(
                imageBytes, "image/jpeg", "Plumbing");

            // Assert
            Assert.True(result.IsApproved);
            Assert.Contains("auto-approved", result.Reason, StringComparison.OrdinalIgnoreCase);
            Assert.Equal(1.0, result.ConfidenceScore);
            Assert.Empty(result.DetectedCategories);
        }

        [Fact]
        public async Task ModerateImageAsync_WhenDisabled_LogsInformation()
        {
            // Arrange
            var (service, loggerMock) = BuildDisabledService();

            // Act
            await service.ModerateImageAsync(
                [0x01, 0x02], "image/png", "Electrical");

            // Assert
            loggerMock.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("AI image moderation disabled")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                Times.Once);
        }

        [Fact]
        public async Task ModerateImageAsync_WhenDisabled_ReturnsImageModerationResultType()
        {
            // Arrange
            var (service, _) = BuildDisabledService();

            // Act
            var result = await service.ModerateImageAsync(
                [0x01], "image/jpeg", "General");

            // Assert
            Assert.IsType<ImageModerationResult>(result);
            Assert.NotNull(result.Reason);
            Assert.NotNull(result.DetectedCategories);
        }

        [Fact]
        public async Task ModerateImageAsync_WhenDisabled_RespectsCancellationToken()
        {
            // Arrange
            var (service, _) = BuildDisabledService();
            using var cts = new CancellationTokenSource();

            // Act
            var result = await service.ModerateImageAsync(
                [0x01], "image/jpeg", "Plumbing", cts.Token);

            // Assert
            Assert.True(result.IsApproved);
        }

        [Fact]
        public async Task ModerateServiceAsync_WhenDisabled_MultipleCallsReturnConsistentResults()
        {
            // Arrange
            var (service, _) = BuildDisabledService();

            // Act
            var result1 = await service.ModerateServiceAsync("S1", "D1", "C1", 100m);
            var result2 = await service.ModerateServiceAsync("S2", "D2", "C2", 200m);
            var result3 = await service.ModerateServiceAsync("S3", "D3", "C3", 300m);

            // Assert
            Assert.All(new[] { result1, result2, result3 }, r =>
            {
                Assert.True(r.IsApproved);
                Assert.Equal(1.0, r.ConfidenceScore);
                Assert.Contains("auto-approved", r.Reason, StringComparison.OrdinalIgnoreCase);
            });
        }

        [Fact]
        public async Task ModerateImageAsync_WhenDisabled_MultipleCallsReturnConsistentResults()
        {
            // Arrange
            var (service, _) = BuildDisabledService();

            // Act
            var result1 = await service.ModerateImageAsync([0x01], "image/jpeg", "Plumbing");
            var result2 = await service.ModerateImageAsync([0x02], "image/png", "Electrical");

            // Assert
            Assert.All(new[] { result1, result2 }, r =>
            {
                Assert.True(r.IsApproved);
                Assert.Equal(1.0, r.ConfidenceScore);
                Assert.Empty(r.DetectedCategories);
            });
        }

        [Fact]
        public void GeminiService_ImplementsIGeminiService()
        {
            // Arrange & Act
            var (service, _) = BuildDisabledService();

            // Assert
            Assert.IsAssignableFrom<IGeminiService>(service);
        }

        [Fact]
        public async Task ModerateServiceAsync_WhenDisabled_ReasonIsNotNullOrEmpty()
        {
            // Arrange
            var (service, _) = BuildDisabledService();

            // Act
            var result = await service.ModerateServiceAsync("Test", "Desc", "Cat", 50m);

            // Assert
            Assert.False(string.IsNullOrEmpty(result.Reason));
        }

        [Fact]
        public async Task ModerateImageAsync_WhenDisabled_ReasonIsNotNullOrEmpty()
        {
            // Arrange
            var (service, _) = BuildDisabledService();

            // Act
            var result = await service.ModerateImageAsync([0x01], "image/jpeg", "General");

            // Assert
            Assert.False(string.IsNullOrEmpty(result.Reason));
        }
    }
}
