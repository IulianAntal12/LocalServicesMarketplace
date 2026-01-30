using LocalServicesMarketplace.Api.Extensions;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = ""
});

// Add services
builder.Services.AddApplicationServices(builder.Configuration);

// Health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Local Services Marketplace API V1");
        c.RoutePrefix = string.Empty;
        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
        c.DefaultModelsExpandDepth(0);
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");

// Output cache for MongoDB images
app.UseOutputCache();

app.UseAuthentication();
app.UseAuthorization();

// Health checks
app.MapHealthChecks("/health");

// Map endpoints
app.MapEndpoints();
app.MapControllers();

// Seed database
await app.SeedDataAsync();

app.Run();