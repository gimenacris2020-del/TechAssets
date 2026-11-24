namespace TechAssets.Domain.Entities;

/// <summary>
/// Registra la trazabilidad histórica de altas, cambios de estado, préstamos y devoluciones de equipos.
/// </summary>
public class MovimientoEquipo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EquipoId { get; set; }
    public Equipo Equipo { get; set; } = null!;

    public Guid? UsuarioResponsableId { get; set; }
    public Usuario? UsuarioResponsable { get; set; }

    public string TipoMovimiento { get; set; } = "Registro";
    public string? EstadoAnterior { get; set; }
    public string EstadoNuevo { get; set; } = "Disponible";
    public DateTime FechaMovimiento { get; set; } = DateTime.UtcNow;
    public string Detalle { get; set; } = string.Empty;
}
