using TechAssets.Application.DTOs.Auth;
using TechAssets.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TechAssets.API.Controllers;

[Route("api/[controller]")]
public class AuthController(IAuthService authService) : BaseApiController
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> AutenticarCredenciales([FromBody] LoginRequestDto request, CancellationToken ct)
    {
        var response = await authService.IniciarSesionAsync(request, ct);
        return Ok(response);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthUserDto>> ConsultarSesionActiva(CancellationToken ct)
    {
        var user = await authService.ObtenerPerfilActualAsync(ObtenerIdUsuarioActual, ct);
        return Ok(user);
    }
}
