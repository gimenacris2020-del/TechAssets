namespace TechAssets.Domain.Entities;

/// <summary>
/// Representa una solicitud o préstamo de un equipo tecnológico hacia un colaborador.
/// </summary>
public class Prestamo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime FechaSolicitud { get; set; } = DateTime.UtcNow;
    public DateTime FechaPrestamo { get; set; }
    public DateTime FechaDevolucionEstimada { get; set; }
    public DateTime? FechaDevolucion { get; set; }
    public string Estado { get; set; } = "Pendiente";
    public string? Observacion { get; set; }
    public string? ObservacionDevolucion { get; set; }

    public Guid UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;

    public Guid? ResponsableId { get; set; }
    public Usuario? Responsable { get; set; }

    public Guid EquipoId { get; set; }
    public Equipo Equipo { get; set; } = null!;
}
