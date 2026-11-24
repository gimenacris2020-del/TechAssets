using System.ComponentModel.DataAnnotations;

namespace TechAssets.Application.DTOs.Usuarios;

public class CreateUsuarioDto
{
    [Required(ErrorMessage = "Los nombres son obligatorios.")]
    [MaxLength(100, ErrorMessage = "Los nombres no pueden exceder 100 caracteres.")]
    public string Nombres { get; set; } = string.Empty;

    [Required(ErrorMessage = "Los apellidos son obligatorios.")]
    [MaxLength(100, ErrorMessage = "Los apellidos no pueden exceder 100 caracteres.")]
    public string Apellidos { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo electrónico es obligatorio.")]
    [EmailAddress(ErrorMessage = "El correo electrónico no tiene un formato válido.")]
    [MaxLength(150, ErrorMessage = "El correo no puede exceder 150 caracteres.")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "El área es obligatoria.")]
    [MaxLength(100, ErrorMessage = "El área no puede exceder 100 caracteres.")]
    public string Area { get; set; } = string.Empty;

    [Required(ErrorMessage = "El rol es obligatorio.")]
    public string Rol { get; set; } = "Colaborador";
}

public class UpdateUsuarioDto
{
    [Required(ErrorMessage = "Los nombres son obligatorios.")]
    [MaxLength(100, ErrorMessage = "Los nombres no pueden exceder 100 caracteres.")]
    public string Nombres { get; set; } = string.Empty;

    [Required(ErrorMessage = "Los apellidos son obligatorios.")]
    [MaxLength(100, ErrorMessage = "Los apellidos no pueden exceder 100 caracteres.")]
    public string Apellidos { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo electrónico es obligatorio.")]
    [EmailAddress(ErrorMessage = "El correo electrónico no tiene un formato válido.")]
    [MaxLength(150, ErrorMessage = "El correo no puede exceder 150 caracteres.")]
    public string Correo { get; set; } = string.Empty;

    [MinLength(6, ErrorMessage = "La nueva contraseña debe tener al menos 6 caracteres.")]
    public string? Password { get; set; }

    [Required(ErrorMessage = "El área es obligatoria.")]
    [MaxLength(100, ErrorMessage = "El área no puede exceder 100 caracteres.")]
    public string Area { get; set; } = string.Empty;

    [Required(ErrorMessage = "El rol es obligatorio.")]
    public string Rol { get; set; } = "Colaborador";
}

public class UsuarioDto
{
    public Guid Id { get; set; }
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public bool Estado { get; set; }
    public DateTime FechaCreacion { get; set; }
}

public class UsuarioFilterDto
{
    public string? Search { get; set; }
    public string? Area { get; set; }
    public string? Rol { get; set; }
    public bool? Estado { get; set; }
}
