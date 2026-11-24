using TechAssets.Application.DTOs.Equipos;
using TechAssets.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TechAssets.API.Controllers;

[Route("api/[controller]")]
[Authorize]
public class EquiposController(IEquipoService equipoService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EquipoDto>>> ConsultarCatalogoEquipos([FromQuery] EquipoFilterDto filter, CancellationToken ct)
    {
        var result = await equipoService.ListarInventarioAsync(filter, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EquipoDto>> ConsultarEquipoPorId(Guid id, CancellationToken ct)
    {
        var result = await equipoService.ObtenerEquipoPorIdAsync(id, ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<EquipoDto>> RegistrarNuevoEquipo([FromBody] CreateEquipoDto dto, CancellationToken ct)
    {
        var created = await equipoService.RegistrarEquipoAsync(dto, ObtenerIdUsuarioActual, ct);
        return CreatedAtAction(nameof(ConsultarEquipoPorId), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<EquipoDto>> ActualizarDatosEquipo(Guid id, [FromBody] UpdateEquipoDto dto, CancellationToken ct)
    {
        var updated = await equipoService.ModificarEquipoAsync(id, dto, ObtenerIdUsuarioActual, ct);
        return Ok(updated);
    }

    [HttpPatch("{id:guid}/estado")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<EquipoDto>> ModificarEstadoEquipo(Guid id, [FromBody] UpdateEstadoEquipoDto dto, CancellationToken ct)
    {
        var updated = await equipoService.CambiarEstadoOperativoAsync(id, dto, ObtenerIdUsuarioActual, ct);
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> EliminarEquipoDelCatalogo(Guid id, CancellationToken ct)
    {
        await equipoService.RemoverEquipoAsync(id, ct);
        return NoContent();
    }
}
