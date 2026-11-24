namespace TechAssets.Domain.Entities;

/// <summary>
/// Representa a un usuario del sistema (Administrador, Responsable de Tecnología o Colaborador).
/// </summary>
public class Usuario
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public string Rol { get; set; } = "Colaborador";
    public bool Estado { get; set; } = true;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public ICollection<Prestamo> PrestamosSolicitados { get; set; } = new List<Prestamo>();
    public ICollection<Prestamo> PrestamosAprobados { get; set; } = new List<Prestamo>();
    public ICollection<MovimientoEquipo> MovimientosRealizados { get; set; } = new List<MovimientoEquipo>();
}
