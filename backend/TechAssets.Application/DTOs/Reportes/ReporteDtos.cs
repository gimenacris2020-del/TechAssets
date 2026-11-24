namespace TechAssets.Application.DTOs.Reportes;

public class DashboardDto
{
    public int TotalEquipos { get; set; }
    public int EquiposDisponibles { get; set; }
    public int EquiposPrestados { get; set; }
    public int EquiposMantenimiento { get; set; }
    public int EquiposBaja { get; set; }
    public int TotalPrestamos { get; set; }
    public int PrestamosPendientes { get; set; }
    public int PrestamosActivos { get; set; }
    public string AreaMayorUso { get; set; } = "Sin registros";
    public int AreaMayorUsoCantidad { get; set; }
}

public class EquiposPorEstadoDto
{
    public string Estado { get; set; } = string.Empty;
    public string EstadoNombre { get; set; } = string.Empty;
    public int Cantidad { get; set; }
}

public class EquipoMasUtilizadoDto
{
    public Guid EquipoId { get; set; }
    public string CodigoPatrimonial { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public int TotalPrestamos { get; set; }
}

public class PrestamosPorAreaDto
{
    public string Area { get; set; } = string.Empty;
    public int TotalPrestamos { get; set; }
    public int PrestamosActivos { get; set; }
}

public class MovimientoEquipoDto
{
    public Guid Id { get; set; }
    public Guid EquipoId { get; set; }
    public string EquipoCodigoPatrimonial { get; set; } = string.Empty;
    public string EquipoNombre { get; set; } = string.Empty;
    public Guid? UsuarioResponsableId { get; set; }
    public string? UsuarioResponsableNombre { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty;
    public string? EstadoAnterior { get; set; }
    public string EstadoNuevo { get; set; } = string.Empty;
    public DateTime FechaMovimiento { get; set; }
    public string Detalle { get; set; } = string.Empty;
}

public class MovimientoFilterDto
{
    public Guid? EquipoId { get; set; }
    public string? TipoMovimiento { get; set; }
    public string? Search { get; set; }
}
