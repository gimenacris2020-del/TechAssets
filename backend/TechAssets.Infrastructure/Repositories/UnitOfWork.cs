using TechAssets.Application.Interfaces;
using TechAssets.Infrastructure.Persistence;

namespace TechAssets.Infrastructure.Repositories;

public class UnitOfWork(AppDbContext context) : IUnitOfWork
{
    public Task<int> ConfirmarCambiosAsync(CancellationToken ct = default)
        => context.SaveChangesAsync(ct);
}
