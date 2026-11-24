using TechAssets.Application.DTOs.Usuarios;
using TechAssets.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TechAssets.API.Controllers;

[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class UsuariosController(IUsuarioService usuarioService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UsuarioDto>>> ConsultarDirectorioUsuarios([FromQuery] UsuarioFilterDto filter, CancellationToken ct)
    {
        var result = await usuarioService.ListarUsuariosAsync(filter, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UsuarioDto>> ConsultarUsuarioPorId(Guid id, CancellationToken ct)
    {
        var result = await usuarioService.ObtenerUsuarioPorIdAsync(id, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioDto>> RegistrarNuevoUsuario([FromBody] CreateUsuarioDto dto, CancellationToken ct)
    {
        var created = await usuarioService.RegistrarUsuarioAsync(dto, ct);
        return CreatedAtAction(nameof(ConsultarUsuarioPorId), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UsuarioDto>> ActualizarDatosUsuario(Guid id, [FromBody] UpdateUsuarioDto dto, CancellationToken ct)
    {
        var updated = await usuarioService.ModificarUsuarioAsync(id, dto, ct);
        return Ok(updated);
    }

    // RN-09: Solo el Administrador podrá deshabilitar usuarios.
    [HttpPatch("{id:guid}/estado")]
    public async Task<ActionResult<UsuarioDto>> ModificarEstadoCuenta(Guid id, [FromQuery] bool activo, CancellationToken ct)
    {
        var updated = await usuarioService.CambiarEstadoAccesoAsync(id, activo, ObtenerRolUsuarioActual, ObtenerIdUsuarioActual, ct);
        return Ok(updated);
    }
}
