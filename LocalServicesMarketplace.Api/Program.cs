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

// Swagger - disponibil în toate environment-urile
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Local Services Marketplace API V1");
    c.RoutePrefix = "swagger";
    c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
    c.DefaultModelsExpandDepth(0);
});

// Railway handles SSL termination, so skip HTTPS redirect in production
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

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
//await app.SeedDataAsync();

app.Run();