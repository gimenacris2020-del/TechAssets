using System.Net;
using System.Text.Json;
using TechAssets.Domain.Exceptions;

namespace TechAssets.API.Middlewares;

/// <summary>
/// Middleware global para interceptar excepciones de dominio y retornar respuestas JSON uniformes.
/// </summary>
public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (AppException ex)
        {
            await WriteErrorResponseAsync(context, ex.StatusCode, ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error no controlado en la solicitud {Method} {Path}", context.Request.Method, context.Request.Path);
            await WriteErrorResponseAsync(
                context,
                (int)HttpStatusCode.InternalServerError,
                "Ocurrió un error interno en el servidor.");
        }
    }

    private static async Task WriteErrorResponseAsync(HttpContext context, int statusCode, string message)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var payload = new
        {
            status = statusCode,
            message
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
    }
}
