using TechAssets.Application.DTOs.Equipos;
using TechAssets.Application.Interfaces;
using TechAssets.Domain.Entities;
using TechAssets.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace TechAssets.Infrastructure.Repositories;

public class EquipoRepository(AppDbContext context) : IEquipoRepository
{
    public Task<Equipo?> BuscarPorIdAsync(Guid id, CancellationToken ct = default)
        => context.Equipos.FirstOrDefaultAsync(e => e.Id == id, ct);

    public Task<bool> VerificarCodigoExistenteAsync(string codigoPatrimonial, Guid? excludeId = null, CancellationToken ct = default)
    {
        var normalized = codigoPatrimonial.Trim().ToUpper();
        return context.Equipos.AnyAsync(
            e => e.CodigoPatrimonial.ToUpper() == normalized && (!excludeId.HasValue || e.Id != excludeId.Value),
            ct);
    }

    public Task<bool> TieneHistorialPrestamosAsync(Guid equipoId, CancellationToken ct = default)
        => context.Prestamos.AnyAsync(p => p.EquipoId == equipoId, ct);

    public async Task<IReadOnlyList<Equipo>> ListarEquiposAsync(EquipoFilterDto filter, CancellationToken ct = default)
    {
        var query = context.Equipos.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var term = filter.Search.Trim().ToLower();
            query = query.Where(e =>
                e.CodigoPatrimonial.ToLower().Contains(term) ||
                e.Nombre.ToLower().Contains(term) ||
                e.Marca.ToLower().Contains(term) ||
                e.Ubicacion.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(filter.Categoria))
        {
            var cat = filter.Categoria.Trim();
            query = query.Where(e => e.Categoria == cat);
        }

        if (!string.IsNullOrWhiteSpace(filter.Estado))
        {
            var est = filter.Estado.Trim();
            query = query.Where(e => e.Estado == est);
        }

        return await query
            .OrderByDescending(e => e.FechaRegistro)
            .ToListAsync(ct);
    }

    public async Task InsertarAsync(Equipo equipo, CancellationToken ct = default)
        => await context.Equipos.AddAsync(equipo, ct);

    public void Modificar(Equipo equipo)
        => context.Equipos.Update(equipo);

    public void Eliminar(Equipo equipo)
        => context.Equipos.Remove(equipo);
}
