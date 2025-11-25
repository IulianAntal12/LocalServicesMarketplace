using LocalServicesMarketplace.Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace LocalServicesMarketplace.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Service> Services { get; set; }
    public DbSet<ServiceCategory> ServiceCategories { get; set; }
    public DbSet<PortfolioImage> PortfolioImages { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure table names
        builder.Entity<ApplicationUser>().ToTable("Users");

        // Configure ApplicationUser
        builder.Entity<ApplicationUser>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.IsActive);

            entity.Property(u => u.FirstName).HasMaxLength(50).IsRequired();
            entity.Property(u => u.LastName).HasMaxLength(50).IsRequired();
            entity.Property(u => u.BusinessName).HasMaxLength(100);
            entity.Property(u => u.BusinessDescription).HasMaxLength(500);
            entity.Property(u => u.Address).HasMaxLength(200);
            entity.Property(u => u.City).HasMaxLength(50);
            entity.Property(u => u.PostalCode).HasMaxLength(20);
            entity.Property(u => u.HourlyRate).HasPrecision(10, 2);
            entity.Property(u => u.ServiceAreas)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                )
                .Metadata.SetValueComparer(new ValueComparer<List<string>>(
                    (c1, c2) => c1!.SequenceEqual(c2!),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToList()
                ));
        });

        // Configure PortfolioImage
        builder.Entity<PortfolioImage>(entity =>
        {
            entity.HasIndex(x => x.ProviderId);

            entity.Property(x => x.FileName).HasMaxLength(255).IsRequired();
            entity.Property(x => x.FilePath).HasMaxLength(500).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(500);
            entity.Property(x => x.ContentType).HasMaxLength(100);

            entity.HasOne(x => x.Provider)
                .WithMany(x => x.PortfolioImages)
                .HasForeignKey(x => x.ProviderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Service
        builder.Entity<Service>(entity =>
        {
            entity.HasIndex(s => s.ProviderId);
            entity.HasIndex(s => s.Category);
            entity.HasIndex(s => s.IsActive);

            entity.Property(s => s.Name).HasMaxLength(100).IsRequired();
            entity.Property(s => s.Description).HasMaxLength(500).IsRequired();
            entity.Property(s => s.Category).HasMaxLength(50).IsRequired();
            entity.Property(s => s.PriceType).HasMaxLength(20).IsRequired();
            entity.Property(s => s.BasePrice).HasPrecision(10, 2);

            entity.HasOne(s => s.Provider)
                .WithMany(u => u.Services)
                .HasForeignKey(s => s.ProviderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure ServiceCategory
        builder.Entity<ServiceCategory>(entity =>
        {
            entity.Property(c => c.Name).HasMaxLength(50).IsRequired();
            entity.Property(c => c.Description).HasMaxLength(200);
            entity.Property(c => c.Icon).HasMaxLength(50);

            entity.HasData(
                new ServiceCategory { Id = 1, Name = "Plumbing", Description = "Plumbing services", DisplayOrder = 1 },
                new ServiceCategory { Id = 2, Name = "Electrical", Description = "Electrical work", DisplayOrder = 2 },
                new ServiceCategory { Id = 3, Name = "Handyman", Description = "General repairs", DisplayOrder = 3 },
                new ServiceCategory { Id = 4, Name = "Cleaning", Description = "Cleaning services", DisplayOrder = 4 },
                new ServiceCategory { Id = 5, Name = "Painting", Description = "Painting services", DisplayOrder = 5 },
                new ServiceCategory { Id = 6, Name = "Carpentry", Description = "Wood work", DisplayOrder = 6 },
                new ServiceCategory { Id = 7, Name = "HVAC", Description = "Heating and cooling", DisplayOrder = 7 },
                new ServiceCategory { Id = 8, Name = "Landscaping", Description = "Garden and yard work", DisplayOrder = 8 }
            );
        });

        // Configure PortfolioImage
        builder.Entity<PortfolioImage>(entity =>
        {
            entity.HasIndex(p => p.ProviderId);

            entity.Property(p => p.FileName).HasMaxLength(255).IsRequired();
            entity.Property(p => p.FilePath).HasMaxLength(500).IsRequired();
            entity.Property(p => p.Description).HasMaxLength(500);
            entity.Property(p => p.ContentType).HasMaxLength(100);

            entity.HasOne(p => p.Provider)
                .WithMany(u => u.PortfolioImages)
                .HasForeignKey(p => p.ProviderId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}