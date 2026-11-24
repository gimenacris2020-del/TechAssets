using TechAssets.Application.DTOs.Reportes;
using TechAssets.Application.Interfaces;
using TechAssets.Domain.Entities;
using TechAssets.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace TechAssets.Infrastructure.Repositories;

public class MovimientoEquipoRepository(AppDbContext context) : IMovimientoEquipoRepository
{
    public async Task<IReadOnlyList<MovimientoEquipo>> ListarConDetallesAsync(
        MovimientoFilterDto filter,
        CancellationToken ct = default)
    {
        var query = context.MovimientosEquipos
            .AsNoTracking()
            .Include(m => m.Equipo)
            .Include(m => m.UsuarioResponsable)
            .AsQueryable();

        if (filter.EquipoId.HasValue)
        {
            query = query.Where(m => m.EquipoId == filter.EquipoId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.TipoMovimiento))
        {
            var tipo = filter.TipoMovimiento.Trim();
            query = query.Where(m => m.TipoMovimiento == tipo);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var term = filter.Search.Trim().ToLower();
            query = query.Where(m =>
                m.Equipo.CodigoPatrimonial.ToLower().Contains(term) ||
                m.Equipo.Nombre.ToLower().Contains(term) ||
                m.Detalle.ToLower().Contains(term));
        }

        return await query
            .OrderByDescending(m => m.FechaMovimiento)
            .ToListAsync(ct);
    }

    public async Task InsertarAsync(MovimientoEquipo movimiento, CancellationToken ct = default)
        => await context.MovimientosEquipos.AddAsync(movimiento, ct);
}
