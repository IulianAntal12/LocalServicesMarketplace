namespace LocalServicesMarketplace.Core.Constants;

public static class Roles
{
    public const string Admin = "Admin";
    public const string Provider = "Provider";
    public const string Customer = "Customer";
    public const string Moderator = "Moderator";

    public static readonly string[] AllRoles = [Admin, Provider, Customer, Moderator];
}