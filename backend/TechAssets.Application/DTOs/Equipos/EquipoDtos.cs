using System.ComponentModel.DataAnnotations;

namespace TechAssets.Application.DTOs.Equipos;

public class CreateEquipoDto
{
    [Required(ErrorMessage = "El código patrimonial es obligatorio.")]
    [MaxLength(50, ErrorMessage = "El código patrimonial no puede exceder 50 caracteres.")]
    public string CodigoPatrimonial { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre del equipo es obligatorio.")]
    [MaxLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres.")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "La categoría es obligatoria.")]
    public string Categoria { get; set; } = string.Empty;

    [Required(ErrorMessage = "La marca es obligatoria.")]
    [MaxLength(50, ErrorMessage = "La marca no puede exceder 50 caracteres.")]
    public string Marca { get; set; } = string.Empty;

    [Required(ErrorMessage = "La ubicación es obligatoria.")]
    [MaxLength(100, ErrorMessage = "La ubicación no puede exceder 100 caracteres.")]
    public string Ubicacion { get; set; } = string.Empty;
}

public class UpdateEquipoDto
{
    [Required(ErrorMessage = "El código patrimonial es obligatorio.")]
    [MaxLength(50, ErrorMessage = "El código patrimonial no puede exceder 50 caracteres.")]
    public string CodigoPatrimonial { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre del equipo es obligatorio.")]
    [MaxLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres.")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "La categoría es obligatoria.")]
    public string Categoria { get; set; } = string.Empty;

    [Required(ErrorMessage = "La marca es obligatoria.")]
    [MaxLength(50, ErrorMessage = "La marca no puede exceder 50 caracteres.")]
    public string Marca { get; set; } = string.Empty;

    [Required(ErrorMessage = "La ubicación es obligatoria.")]
    [MaxLength(100, ErrorMessage = "La ubicación no puede exceder 100 caracteres.")]
    public string Ubicacion { get; set; } = string.Empty;
}

public class UpdateEstadoEquipoDto
{
    [Required(ErrorMessage = "El estado es obligatorio.")]
    public string Estado { get; set; } = string.Empty;

    [MaxLength(300, ErrorMessage = "El motivo no puede exceder 300 caracteres.")]
    public string? Motivo { get; set; }
}

public class EquipoDto
{
    public Guid Id { get; set; }
    public string CodigoPatrimonial { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Ubicacion { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public DateTime FechaRegistro { get; set; }
}

public class EquipoFilterDto
{
    public string? Search { get; set; }
    public string? Categoria { get; set; }
    public string? Estado { get; set; }
}
