using TechAssets.Application.DTOs.Reportes;
using TechAssets.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TechAssets.API.Controllers;

[Route("api/[controller]")]
[Authorize]
public class ReportesController(IReporteService reporteService) : BaseApiController
{
    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardDto>> ConsultarResumenDashboard(CancellationToken ct)
    {
        var result = await reporteService.ObtenerIndicadoresGeneralesAsync(ct);
        return Ok(result);
    }

    [HttpGet("equipos-por-estado")]
    public async Task<ActionResult<IReadOnlyList<EquiposPorEstadoDto>>> ConsultarEquiposPorEstado(CancellationToken ct)
    {
        var result = await reporteService.ObtenerDistribucionPorEstadoAsync(ct);
        return Ok(result);
    }

    [HttpGet("equipos-mas-utilizados")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<IReadOnlyList<EquipoMasUtilizadoDto>>> ConsultarRankingUtilizacion([FromQuery] int top = 10, CancellationToken ct = default)
    {
        var result = await reporteService.ObtenerRankingEquiposAsync(top, ct);
        return Ok(result);
    }

    [HttpGet("prestamos-por-area")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<IReadOnlyList<PrestamosPorAreaDto>>> ConsultarDemandaPorArea(CancellationToken ct)
    {
        var result = await reporteService.ObtenerMetricasPorAreaAsync(ct);
        return Ok(result);
    }

    [HttpGet("movimientos")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    public async Task<ActionResult<IReadOnlyList<MovimientoEquipoDto>>> ConsultarBitacoraMovimientos([FromQuery] MovimientoFilterDto filter, CancellationToken ct)
    {
        var result = await reporteService.ObtenerBitacoraMovimientosAsync(filter, ct);
        return Ok(result);
    }
}
