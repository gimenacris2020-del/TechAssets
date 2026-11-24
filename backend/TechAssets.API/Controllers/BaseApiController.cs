using System.Security.Claims;
using TechAssets.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace TechAssets.API.Controllers;

[ApiController]
public abstract class BaseApiController : ControllerBase
{
    private static readonly string[] RolesValidos =
    [
        "Administrador",
        "ResponsableTecnologia",
        "Colaborador"
    ];

    protected Guid ObtenerIdUsuarioActual
    {
        get
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            if (!Guid.TryParse(raw, out var userId))
            {
                throw new UnauthorizedException("Token inválido o sin identificador de usuario.");
            }

            return userId;
        }
    }

    protected string ObtenerRolUsuarioActual
    {
        get
        {
            var raw = User.FindFirstValue(ClaimTypes.Role);
            if (string.IsNullOrWhiteSpace(raw) || !RolesValidos.Contains(raw.Trim()))
            {
                throw new UnauthorizedException("Token inválido o sin rol asignado.");
            }

            return raw.Trim();
        }
    }
}
