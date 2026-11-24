using TechAssets.Application.DTOs.Prestamos;
using TechAssets.Application.Interfaces;
using TechAssets.Domain.Entities;
using TechAssets.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace TechAssets.Infrastructure.Repositories;

public class PrestamoRepository(AppDbContext context) : IPrestamoRepository
{
    public Task<Prestamo?> BuscarDetallePorIdAsync(Guid id, CancellationToken ct = default)
        => context.Prestamos
            .Include(p => p.Usuario)
            .Include(p => p.Responsable)
            .Include(p => p.Equipo)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public Task<bool> ExistePrestamoActivoParaEquipoAsync(Guid equipoId, CancellationToken ct = default)
        => context.Prestamos.AnyAsync(p => p.EquipoId == equipoId && p.Estado == "Activo", ct);

    public async Task<IReadOnlyList<Prestamo>> ListarConDetallesAsync(PrestamoFilterDto filter, CancellationToken ct = default)
    {
        var query = context.Prestamos
            .AsNoTracking()
            .Include(p => p.Usuario)
            .Include(p => p.Responsable)
            .Include(p => p.Equipo)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var term = filter.Search.Trim().ToLower();
            query = query.Where(p =>
                p.Equipo.CodigoPatrimonial.ToLower().Contains(term) ||
                p.Equipo.Nombre.ToLower().Contains(term) ||
                p.Usuario.Nombres.ToLower().Contains(term) ||
                p.Usuario.Apellidos.ToLower().Contains(term) ||
                p.Usuario.Area.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(filter.Estado))
        {
            var est = filter.Estado.Trim();
            query = query.Where(p => p.Estado == est);
        }

        if (!string.IsNullOrWhiteSpace(filter.Area))
        {
            var area = filter.Area.Trim().ToLower();
            query = query.Where(p => p.Usuario.Area.ToLower().Contains(area));
        }

        if (filter.UsuarioId.HasValue)
        {
            query = query.Where(p => p.UsuarioId == filter.UsuarioId.Value);
        }

        if (filter.EquipoId.HasValue)
        {
            query = query.Where(p => p.EquipoId == filter.EquipoId.Value);
        }

        return await query
            .OrderByDescending(p => p.FechaSolicitud)
            .ToListAsync(ct);
    }

    public async Task InsertarAsync(Prestamo prestamo, CancellationToken ct = default)
        => await context.Prestamos.AddAsync(prestamo, ct);

    public void Modificar(Prestamo prestamo)
        => context.Prestamos.Update(prestamo);
}
