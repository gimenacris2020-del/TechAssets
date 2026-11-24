using TechAssets.Application.DTOs.Prestamos;
using TechAssets.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TechAssets.API.Controllers;

[Route("api/[controller]")]
[Authorize]
public class PrestamosController(IPrestamoService prestamoService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PrestamoDto>>> ConsultarListaPrestamos([FromQuery] PrestamoFilterDto filter, CancellationToken ct)
    {
        var result = await prestamoService.ListarPrestamosAsync(filter, ObtenerIdUsuarioActual, ObtenerRolUsuarioActual, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PrestamoDto>> ConsultarDetallePrestamo(Guid id, CancellationToken ct)
    {
        var result = await prestamoService.ObtenerPrestamoPorIdAsync(id, ObtenerIdUsuarioActual, ObtenerRolUsuarioActual, ct);
        return Ok(result);
    }

    [HttpPost("solicitar")]
    public async Task<ActionResult<PrestamoDto>> RegistrarSolicitudPrestamo([FromBody] SolicitarPrestamoDto dto, CancellationToken ct)
    {
        var created = await prestamoService.GenerarSolicitudPrestamoAsync(dto, ObtenerIdUsuarioActual, ct);
        return CreatedAtAction(nameof(ConsultarDetallePrestamo), new { id = created.Id }, created);
    }

    [HttpPatch("{id:guid}/aprobar")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<PrestamoDto>> AutorizarSolicitudPrestamo(Guid id, CancellationToken ct)
    {
        var updated = await prestamoService.AutorizarPrestamoAsync(id, ObtenerIdUsuarioActual, ct);
        return Ok(updated);
    }

    [HttpPatch("{id:guid}/rechazar")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<PrestamoDto>> DenegarSolicitudPrestamo(Guid id, [FromBody] RechazarPrestamoDto dto, CancellationToken ct)
    {
        var updated = await prestamoService.DenegarPrestamoAsync(id, dto, ObtenerIdUsuarioActual, ct);
        return Ok(updated);
    }

    [HttpPatch("{id:guid}/devolver")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<PrestamoDto>> ConfirmarDevolucionEquipo(Guid id, [FromBody] RegistrarDevolucionDto dto, CancellationToken ct)
    {
        var updated = await prestamoService.ProcesarDevolucionAsync(id, dto, ObtenerIdUsuarioActual, ct);
        return Ok(updated);
    }
}
