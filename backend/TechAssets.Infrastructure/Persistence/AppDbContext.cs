using TechAssets.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace TechAssets.Infrastructure.Persistence;

/// <summary>
/// Contexto de Entity Framework Core para PostgreSQL del sistema TechAssets.
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Equipo> Equipos => Set<Equipo>();
    public DbSet<Prestamo> Prestamos => Set<Prestamo>();
    public DbSet<MovimientoEquipo> MovimientosEquipos => Set<MovimientoEquipo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.ToTable("usuarios");
            entity.HasKey(u => u.Id);

            entity.Property(u => u.Nombres).HasMaxLength(100).IsRequired();
            entity.Property(u => u.Apellidos).HasMaxLength(100).IsRequired();
            entity.Property(u => u.Correo).HasMaxLength(150).IsRequired();
            entity.Property(u => u.PasswordHash).HasMaxLength(255).IsRequired();
            entity.Property(u => u.Area).HasMaxLength(100).IsRequired();
            entity.Property(u => u.Rol).HasMaxLength(40).IsRequired();
            entity.Property(u => u.Estado).IsRequired();
            entity.Property(u => u.FechaCreacion).IsRequired();

            // RN-08: El correo electrónico del usuario debe ser único.
            entity.HasIndex(u => u.Correo).IsUnique();
        });

        modelBuilder.Entity<Equipo>(entity =>
        {
            entity.ToTable("equipos");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.CodigoPatrimonial).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Nombre).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Categoria).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Marca).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Ubicacion).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Estado).HasMaxLength(30).IsRequired();
            entity.Property(e => e.FechaRegistro).IsRequired();

            // RN-07: El código patrimonial debe ser único.
            entity.HasIndex(e => e.CodigoPatrimonial).IsUnique();
        });

        modelBuilder.Entity<Prestamo>(entity =>
        {
            entity.ToTable("prestamos");
            entity.HasKey(p => p.Id);

            entity.Property(p => p.FechaSolicitud).IsRequired();
            entity.Property(p => p.FechaPrestamo).IsRequired();
            entity.Property(p => p.FechaDevolucionEstimada).IsRequired();
            entity.Property(p => p.Estado).HasMaxLength(30).IsRequired();
            entity.Property(p => p.Observacion).HasColumnType("text");
            entity.Property(p => p.ObservacionDevolucion).HasColumnType("text");

            entity.HasOne(p => p.Usuario)
                .WithMany(u => u.PrestamosSolicitados)
                .HasForeignKey(p => p.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.Responsable)
                .WithMany(u => u.PrestamosAprobados)
                .HasForeignKey(p => p.ResponsableId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.Equipo)
                .WithMany(e => e.Prestamos)
                .HasForeignKey(p => p.EquipoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<MovimientoEquipo>(entity =>
        {
            entity.ToTable("movimientos_equipos");
            entity.HasKey(m => m.Id);

            entity.Property(m => m.TipoMovimiento).HasMaxLength(40).IsRequired();
            entity.Property(m => m.EstadoAnterior).HasMaxLength(30);
            entity.Property(m => m.EstadoNuevo).HasMaxLength(30).IsRequired();
            entity.Property(m => m.FechaMovimiento).IsRequired();
            entity.Property(m => m.Detalle).HasColumnType("text").IsRequired();

            entity.HasOne(m => m.Equipo)
                .WithMany(e => e.Movimientos)
                .HasForeignKey(m => m.EquipoId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(m => m.UsuarioResponsable)
                .WithMany(u => u.MovimientosRealizados)
                .HasForeignKey(m => m.UsuarioResponsableId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
