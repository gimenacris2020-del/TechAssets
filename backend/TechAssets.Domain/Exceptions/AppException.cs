namespace TechAssets.Domain.Exceptions;

/// <summary>
/// Excepción base del dominio para errores controlados con código de estado HTTP asociado.
/// </summary>
public abstract class AppException(string message, int statusCode) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}

public sealed class BusinessRuleException(string message) : AppException(message, 400);

public sealed class UnauthorizedException(string message) : AppException(message, 401);

public sealed class ForbiddenException(string message) : AppException(message, 403);

public sealed class NotFoundException(string message) : AppException(message, 404);

public sealed class ConflictException(string message) : AppException(message, 409);
