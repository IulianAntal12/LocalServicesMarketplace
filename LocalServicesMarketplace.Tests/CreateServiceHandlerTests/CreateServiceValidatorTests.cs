using LocalServicesMarketplace.Api.Features.Providers.Services.CreateService;

namespace LocalServicesMarketplace.Tests.CreateServiceHandlerTests
{
    public class CreateServiceValidatorTests
    {
        private readonly CreateServiceValidator _validator = new();

        // Helper pentru comanda valida
        private static CreateServiceCommand ValidCommand() => new()
        {
            Name = "Reparatii electrice",
            Description = "Montaj prize, intrerupatoare si tablouri electrice.",
            Category = "Electrical",
            BasePrice = 200m,
            PriceType = "Hourly",
            EstimatedDurationMinutes = 90
        };

        [Fact]
        public async Task Validate_WithValidCommand_PassesValidation()
        {
            var result = await _validator.ValidateAsync(ValidCommand());
            Assert.True(result.IsValid);
        }

        [Theory]
        [InlineData("")]
        [InlineData("   ")]
        public async Task Validate_WithEmptyName_FailsValidation(string name)
        {
            var command = ValidCommand();
            command.Name = name;

            var result = await _validator.ValidateAsync(command);

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "Name" && e.ErrorMessage.Contains("required"));
        }

        [Fact]
        public async Task Validate_WithNameExceeding100Chars_FailsValidation()
        {
            var command = ValidCommand();
            command.Name = new string('A', 101);

            var result = await _validator.ValidateAsync(command);

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "Name" && e.ErrorMessage.Contains("100"));
        }

        [Fact]
        public async Task Validate_WithNameExactly100Chars_PassesValidation()
        {
            var command = ValidCommand();
            command.Name = new string('A', 100);

            var result = await _validator.ValidateAsync(command);

            Assert.True(result.IsValid);
        }

        [Fact]
        public async Task Validate_WithEmptyDescription_FailsValidation()
        {
            var command = ValidCommand();
            command.Description = "";

            var result = await _validator.ValidateAsync(command);

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "Description");
        }

        [Fact]
        public async Task Validate_WithDescriptionExceeding500Chars_FailsValidation()
        {
            var command = ValidCommand();
            command.Description = new string('X', 501);

            var result = await _validator.ValidateAsync(command);

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "Description" && e.ErrorMessage.Contains("500"));
        }

        [Fact]
        public async Task Validate_WithEmptyCategory_FailsValidation()
        {
            var command = ValidCommand();
            command.Category = "";

            var result = await _validator.ValidateAsync(command);

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "Category");
        }

        [Theory]
        [InlineData(0)]
        [InlineData(1)]
        [InlineData(99999)]
        public async Task Validate_WithValidBasePrice_PassesValidation(decimal price)
        {
            var command = ValidCommand();
            command.BasePrice = price;

            var result = await _validator.ValidateAsync(command);

            Assert.True(result.IsValid);
        }

        [Fact]
        public async Task Validate_WithNegativeBasePrice_FailsValidation()
        {
            var command = ValidCommand();
            command.BasePrice = -1m;

            var result = await _validator.ValidateAsync(command);

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "BasePrice" && e.ErrorMessage.Contains("positive"));
        }

        [Fact]
        public async Task Validate_WithBasePriceEqualOrOver100000_FailsValidation()
        {
            var command = ValidCommand();
            command.BasePrice = 100000m;

            var result = await _validator.ValidateAsync(command);

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "BasePrice");
        }

        [Theory]
        [InlineData("Hourly")]
        [InlineData("Fixed")]
        [InlineData("Quote")]
        public async Task Validate_WithValidPriceType_PassesValidation(string priceType)
        {
            var command = ValidCommand();
            command.PriceType = priceType;

            var result = await _validator.ValidateAsync(command);

            Assert.True(result.IsValid);
        }

        [Theory]
        [InlineData("Daily")]
        [InlineData("monthly")]
        [InlineData("")]
        [InlineData("HOURLY")]
        public async Task Validate_WithInvalidPriceType_FailsValidation(string priceType)
        {
            var command = ValidCommand();
            command.PriceType = priceType;

            var result = await _validator.ValidateAsync(command);

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e =>
                e.PropertyName == "PriceType" &&
                e.ErrorMessage.Contains("Hourly, Fixed, or Quote"));
        }

        [Theory]
        [InlineData(1)]
        [InlineData(60)]
        [InlineData(480)]
        public async Task Validate_WithValidDuration_PassesValidation(int minutes)
        {
            var command = ValidCommand();
            command.EstimatedDurationMinutes = minutes;

            var result = await _validator.ValidateAsync(command);

            Assert.True(result.IsValid);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        [InlineData(481)]
        [InlineData(1000)]
        public async Task Validate_WithInvalidDuration_FailsValidation(int minutes)
        {
            var command = ValidCommand();
            command.EstimatedDurationMinutes = minutes;

            var result = await _validator.ValidateAsync(command);

            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "EstimatedDurationMinutes");
        }

        [Fact]
        public async Task Validate_WithMultipleInvalidFields_ReturnsAllErrors()
        {
            var command = new CreateServiceCommand
            {
                Name = "",
                Description = "",
                Category = "",
                BasePrice = -100m,
                PriceType = "InvalidType",
                EstimatedDurationMinutes = 0
            };

            var result = await _validator.ValidateAsync(command);

            Assert.False(result.IsValid);
            Assert.True(result.Errors.Count >= 5, "Ar trebui sa existe cel putin 5 erori de validare");
        }
    }
}
