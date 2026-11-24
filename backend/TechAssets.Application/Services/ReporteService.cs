using TechAssets.Application.DTOs.Equipos;
using TechAssets.Application.DTOs.Prestamos;
using TechAssets.Application.DTOs.Reportes;
using TechAssets.Application.Interfaces;

namespace TechAssets.Application.Services;

public class ReporteService(
    IEquipoRepository equipoRepository,
    IPrestamoRepository prestamoRepository,
    IMovimientoEquipoRepository movimientoRepository) : IReporteService
{
    private static readonly string[] EstadosEquipo =
    [
        "Disponible",
        "Prestado",
        "Mantenimiento",
        "Baja"
    ];

    public async Task<DashboardDto> ObtenerIndicadoresGeneralesAsync(CancellationToken ct = default)
    {
        var equipos = await equipoRepository.ListarEquiposAsync(new EquipoFilterDto(), ct);
        var prestamos = await prestamoRepository.ListarConDetallesAsync(new PrestamoFilterDto(), ct);

        var prestamosValidos = prestamos
            .Where(p => p.Estado == "Activo" || p.Estado == "Devuelto")
            .ToList();

        var topArea = prestamosValidos
            .GroupBy(p => p.Usuario.Area)
            .Select(g => new { Area = g.Key, Cantidad = g.Count() })
            .OrderByDescending(x => x.Cantidad)
            .FirstOrDefault();

        return new DashboardDto
        {
            TotalEquipos = equipos.Count,
            EquiposDisponibles = equipos.Count(e => e.Estado == "Disponible"),
            EquiposPrestados = equipos.Count(e => e.Estado == "Prestado"),
            EquiposMantenimiento = equipos.Count(e => e.Estado == "Mantenimiento"),
            EquiposBaja = equipos.Count(e => e.Estado == "Baja"),
            TotalPrestamos = prestamosValidos.Count,
            PrestamosPendientes = prestamos.Count(p => p.Estado == "Pendiente"),
            PrestamosActivos = prestamos.Count(p => p.Estado == "Activo"),
            AreaMayorUso = topArea?.Area ?? "Sin registros",
            AreaMayorUsoCantidad = topArea?.Cantidad ?? 0
        };
    }

    public async Task<IReadOnlyList<EquiposPorEstadoDto>> ObtenerDistribucionPorEstadoAsync(CancellationToken ct = default)
    {
        var equipos = await equipoRepository.ListarEquiposAsync(new EquipoFilterDto(), ct);

        return EstadosEquipo
            .Select(estado => new EquiposPorEstadoDto
            {
                Estado = estado,
                EstadoNombre = estado,
                Cantidad = equipos.Count(e => e.Estado == estado)
            })
            .ToList();
    }

    public async Task<IReadOnlyList<EquipoMasUtilizadoDto>> ObtenerRankingEquiposAsync(int top = 10, CancellationToken ct = default)
    {
        var prestamos = await prestamoRepository.ListarConDetallesAsync(new PrestamoFilterDto(), ct);

        return prestamos
            .Where(p => p.Estado == "Activo" || p.Estado == "Devuelto")
            .GroupBy(p => p.EquipoId)
            .Select(g =>
            {
                var eq = g.First().Equipo;
                return new EquipoMasUtilizadoDto
                {
                    EquipoId = eq.Id,
                    CodigoPatrimonial = eq.CodigoPatrimonial,
                    Nombre = eq.Nombre,
                    Categoria = eq.Categoria,
                    Marca = eq.Marca,
                    TotalPrestamos = g.Count()
                };
            })
            .OrderByDescending(x => x.TotalPrestamos)
            .Take(top)
            .ToList();
    }

    public async Task<IReadOnlyList<PrestamosPorAreaDto>> ObtenerMetricasPorAreaAsync(CancellationToken ct = default)
    {
        var prestamos = await prestamoRepository.ListarConDetallesAsync(new PrestamoFilterDto(), ct);

        return prestamos
            .Where(p => p.Estado == "Activo" || p.Estado == "Devuelto")
            .GroupBy(p => p.Usuario.Area)
            .Select(g => new PrestamosPorAreaDto
            {
                Area = g.Key,
                TotalPrestamos = g.Count(),
                PrestamosActivos = g.Count(p => p.Estado == "Activo")
            })
            .OrderByDescending(x => x.TotalPrestamos)
            .ToList();
    }

    public async Task<IReadOnlyList<MovimientoEquipoDto>> ObtenerBitacoraMovimientosAsync(
        MovimientoFilterDto filter,
        CancellationToken ct = default)
    {
        var movimientos = await movimientoRepository.ListarConDetallesAsync(filter, ct);

        return movimientos.Select(m => new MovimientoEquipoDto
        {
            Id = m.Id,
            EquipoId = m.EquipoId,
            EquipoCodigoPatrimonial = m.Equipo.CodigoPatrimonial,
            EquipoNombre = m.Equipo.Nombre,
            UsuarioResponsableId = m.UsuarioResponsableId,
            UsuarioResponsableNombre = m.UsuarioResponsable is null
                ? null
                : $"{m.UsuarioResponsable.Nombres} {m.UsuarioResponsable.Apellidos}".Trim(),
            TipoMovimiento = m.TipoMovimiento,
            EstadoAnterior = m.EstadoAnterior,
            EstadoNuevo = m.EstadoNuevo,
            FechaMovimiento = m.FechaMovimiento,
            Detalle = m.Detalle
        }).ToList();
    }
}
