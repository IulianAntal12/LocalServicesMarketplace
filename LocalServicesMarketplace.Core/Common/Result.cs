using System.Net;

namespace LocalServicesMarketplace.Core.Common;

public class Result<TEntity>
{
    public TEntity? Entity { get; private init; }
    public HttpStatusCode StatusCode { get; private init; }
    public string? Error { get; private init; }
    public List<string> Errors { get; private init; } = [];
    public required bool IsSuccess { get; init; }
    public bool IsFailure => !IsSuccess;

    public static Result<TEntity> Success(TEntity entity, HttpStatusCode statusCode = HttpStatusCode.OK) => new()
    {
        Entity = entity,
        IsSuccess = true,
        StatusCode = statusCode,
        Errors = []
    };

    public static Result<TEntity> SuccessNoContent(HttpStatusCode statusCode = HttpStatusCode.NoContent) => new()
    {
        IsSuccess = true,
        StatusCode = statusCode,
        Errors = []
    };

    public static Result<TEntity> Failure(HttpStatusCode statusCode, string error) => new()
    {
        Error = error,
        Errors = [error],
        StatusCode = statusCode,
        IsSuccess = false
    };

    public static Result<TEntity> Failure(HttpStatusCode statusCode, List<string> errors) => new()
    {
        Error = errors.FirstOrDefault(),
        Errors = errors,
        StatusCode = statusCode,
        IsSuccess = false
    };

    public static Result<TEntity> Failure(string error = "Failure")
        => Failure(HttpStatusCode.BadRequest, error);

    public static Result<TEntity> NotFound(string error = "Resource not found")
        => Failure(HttpStatusCode.NotFound, error);

    public static Result<TEntity> BadRequest(string error)
        => Failure(HttpStatusCode.BadRequest, error);

    public static Result<TEntity> Unauthorized(string error = "Unauthorized")
        => Failure(HttpStatusCode.Unauthorized, error);

    public static Result<TEntity> Forbidden(string error = "Access denied")
        => Failure(HttpStatusCode.Forbidden, error);

    public static Result<TEntity> Locked(string error = "Resource locked")
        => Failure(HttpStatusCode.Locked, error);

    public static Result<TEntity> Conflict(string error)
        => Failure(HttpStatusCode.Conflict, error);

    public static Result<TEntity> ValidationFailure(List<string> errors)
        => Failure(HttpStatusCode.BadRequest, errors);
}

public class Result
{
    public HttpStatusCode StatusCode { get; private init; }
    public string? Error { get; private init; }
    public List<string> Errors { get; private init; } = [];
    public required bool IsSuccess { get; init; }
    public bool IsFailure => !IsSuccess;

    public static Result Success(HttpStatusCode statusCode = HttpStatusCode.OK) => new()
    {
        IsSuccess = true,
        StatusCode = statusCode,
        Errors = []
    };

    public static Result Failure(HttpStatusCode statusCode, string error) => new()
    {
        Error = error,
        Errors = [error],
        StatusCode = statusCode,
        IsSuccess = false
    };

    public static Result Failure(HttpStatusCode statusCode, List<string> errors) => new()
    {
        Error = errors.FirstOrDefault(),
        Errors = errors,
        StatusCode = statusCode,
        IsSuccess = false
    };

    public static Result NotFound(string error = "Resource not found")
        => Failure(HttpStatusCode.NotFound, error);

    public static Result BadRequest(string error)
        => Failure(HttpStatusCode.BadRequest, error);

    public static Result NoContent()
        => Success(HttpStatusCode.NoContent);

    public static Result Forbidden(string error)
        => Failure(HttpStatusCode.Forbidden, error);
}