using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LocalServicesMarketplace.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProviderFeatures2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PortfolioImage_Users_ProviderId",
                table: "PortfolioImage");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PortfolioImage",
                table: "PortfolioImage");

            migrationBuilder.RenameTable(
                name: "PortfolioImage",
                newName: "PortfolioImages");

            migrationBuilder.RenameIndex(
                name: "IX_PortfolioImage_ProviderId",
                table: "PortfolioImages",
                newName: "IX_PortfolioImages_ProviderId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PortfolioImages",
                table: "PortfolioImages",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "ServiceCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Icon = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProviderId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BasePrice = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    PriceType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    EstimatedDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Services_Users_ProviderId",
                        column: x => x.ProviderId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "ServiceCategories",
                columns: new[] { "Id", "Description", "DisplayOrder", "Icon", "IsActive", "Name" },
                values: new object[,]
                {
                    { 1, "Plumbing services", 1, null, true, "Plumbing" },
                    { 2, "Electrical work", 2, null, true, "Electrical" },
                    { 3, "General repairs", 3, null, true, "Handyman" },
                    { 4, "Cleaning services", 4, null, true, "Cleaning" },
                    { 5, "Painting services", 5, null, true, "Painting" },
                    { 6, "Wood work", 6, null, true, "Carpentry" },
                    { 7, "Heating and cooling", 7, null, true, "HVAC" },
                    { 8, "Garden and yard work", 8, null, true, "Landscaping" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Services_Category",
                table: "Services",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Services_IsActive",
                table: "Services",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_Services_ProviderId",
                table: "Services",
                column: "ProviderId");

            migrationBuilder.AddForeignKey(
                name: "FK_PortfolioImages_Users_ProviderId",
                table: "PortfolioImages",
                column: "ProviderId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PortfolioImages_Users_ProviderId",
                table: "PortfolioImages");

            migrationBuilder.DropTable(
                name: "ServiceCategories");

            migrationBuilder.DropTable(
                name: "Services");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PortfolioImages",
                table: "PortfolioImages");

            migrationBuilder.RenameTable(
                name: "PortfolioImages",
                newName: "PortfolioImage");

            migrationBuilder.RenameIndex(
                name: "IX_PortfolioImages_ProviderId",
                table: "PortfolioImage",
                newName: "IX_PortfolioImage_ProviderId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PortfolioImage",
                table: "PortfolioImage",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PortfolioImage_Users_ProviderId",
                table: "PortfolioImage",
                column: "ProviderId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
