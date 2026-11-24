using System.ComponentModel.DataAnnotations;

namespace TechAssets.Application.DTOs.Prestamos;

public class SolicitarPrestamoDto
{
    [Required(ErrorMessage = "Debe seleccionar un equipo.")]
    public Guid EquipoId { get; set; }

    [Required(ErrorMessage = "La fecha de préstamo es obligatoria.")]
    public DateTime FechaPrestamo { get; set; }

    [Required(ErrorMessage = "La fecha estimada de devolución es obligatoria.")]
    public DateTime FechaDevolucionEstimada { get; set; }

    [MaxLength(500, ErrorMessage = "La observación no puede exceder 500 caracteres.")]
    public string? Observacion { get; set; }
}

public class RechazarPrestamoDto
{
    [Required(ErrorMessage = "Debe indicar el motivo del rechazo.")]
    [MaxLength(500, ErrorMessage = "El motivo no puede exceder 500 caracteres.")]
    public string Motivo { get; set; } = string.Empty;
}

public class RegistrarDevolucionDto
{
    [Required(ErrorMessage = "La fecha de devolución es obligatoria.")]
    public DateTime FechaDevolucion { get; set; }

    [Required(ErrorMessage = "Toda devolución debe registrar observaciones.")]
    [MinLength(3, ErrorMessage = "La observación de devolución debe tener al menos 3 caracteres.")]
    [MaxLength(1000, ErrorMessage = "La observación no puede exceder 1000 caracteres.")]
    public string ObservacionDevolucion { get; set; } = string.Empty;

    public bool EnviarAMantenimiento { get; set; } = false;
}

public class PrestamoDto
{
    public Guid Id { get; set; }
    public DateTime FechaSolicitud { get; set; }
    public DateTime FechaPrestamo { get; set; }
    public DateTime FechaDevolucionEstimada { get; set; }
    public DateTime? FechaDevolucion { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? Observacion { get; set; }
    public string? ObservacionDevolucion { get; set; }

    public Guid UsuarioId { get; set; }
    public string UsuarioNombre { get; set; } = string.Empty;
    public string UsuarioArea { get; set; } = string.Empty;

    public Guid? ResponsableId { get; set; }
    public string? ResponsableNombre { get; set; }

    public Guid EquipoId { get; set; }
    public string EquipoCodigoPatrimonial { get; set; } = string.Empty;
    public string EquipoNombre { get; set; } = string.Empty;
    public string EquipoCategoria { get; set; } = string.Empty;
}

public class PrestamoFilterDto
{
    public string? Search { get; set; }
    public string? Estado { get; set; }
    public string? Area { get; set; }
    public Guid? UsuarioId { get; set; }
    public Guid? EquipoId { get; set; }
}
