using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LocalServicesMarketplace.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceModeration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ModeratedAt",
                table: "Services",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModeratedBy",
                table: "Services",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModerationReason",
                table: "Services",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModerationStatus",
                table: "Services",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "ModerationLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    OldStatus = table.Column<int>(type: "int", maxLength: 20, nullable: false),
                    NewStatus = table.Column<int>(type: "int", maxLength: 20, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ModeratedBy = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModerationLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModerationLogs_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ModerationLogs_Users_ModeratedBy",
                        column: x => x.ModeratedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Services_ModerationStatus",
                table: "Services",
                column: "ModerationStatus");

            migrationBuilder.CreateIndex(
                name: "IX_ModerationLogs_CreatedAt",
                table: "ModerationLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ModerationLogs_ModeratedBy",
                table: "ModerationLogs",
                column: "ModeratedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ModerationLogs_ServiceId",
                table: "ModerationLogs",
                column: "ServiceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ModerationLogs");

            migrationBuilder.DropIndex(
                name: "IX_Services_ModerationStatus",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "ModeratedAt",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "ModeratedBy",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "ModerationReason",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "ModerationStatus",
                table: "Services");
        }
    }
}
