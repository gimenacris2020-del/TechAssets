namespace TechAssets.Domain.Entities;

/// <summary>
/// Representa un activo tecnológico perteneciente al inventario institucional.
/// </summary>
public class Equipo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CodigoPatrimonial { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Categoria { get; set; } = "Laptop";
    public string Marca { get; set; } = string.Empty;
    public string Ubicacion { get; set; } = string.Empty;
    public string Estado { get; set; } = "Disponible";
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    public ICollection<Prestamo> Prestamos { get; set; } = new List<Prestamo>();
    public ICollection<MovimientoEquipo> Movimientos { get; set; } = new List<MovimientoEquipo>();
}
