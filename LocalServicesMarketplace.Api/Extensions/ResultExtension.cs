using LocalServicesMarketplace.Core.Common;
using System.Net;

namespace LocalServicesMarketplace.Api.Extensions;

public static class ResultExtensions
{
    public static IResult ToApiResponse<T>(this Result<T> result)
    {
        if (result.IsSuccess)
        {
            return result.StatusCode switch
            {
                HttpStatusCode.NoContent => Results.NoContent(),
                HttpStatusCode.Created => Results.Created("", result.Entity),
                _ => Results.Ok(result.Entity)
            };
        }

        return result.StatusCode switch
        {
            HttpStatusCode.NotFound => Results.NotFound(new { error = result.Error, errors = result.Errors }),
            HttpStatusCode.Unauthorized => Results.Unauthorized(),
            HttpStatusCode.Forbidden => Results.Forbid(),
            HttpStatusCode.Conflict => Results.Conflict(new { error = result.Error, errors = result.Errors }),
            HttpStatusCode.BadRequest => Results.BadRequest(new { error = result.Error, errors = result.Errors }),
            (HttpStatusCode)423 => Results.Problem(
                detail: result.Error,
                statusCode: 423,
                title: "Locked"),
            _ => Results.Problem(result.Error)
        };
    }

    public static IResult ToApiResponse(this Result result)
    {
        if (result.IsSuccess)
        {
            return result.StatusCode switch
            {
                HttpStatusCode.NoContent => Results.NoContent(),
                _ => Results.Ok()
            };
        }

        return result.StatusCode switch
        {
            HttpStatusCode.NotFound => Results.NotFound(new { error = result.Error }),
            HttpStatusCode.Unauthorized => Results.Unauthorized(),
            HttpStatusCode.Forbidden => Results.Forbid(),
            HttpStatusCode.BadRequest => Results.BadRequest(new { errors = result.Errors }),
            _ => Results.Problem(result.Error)
        };
    }
}