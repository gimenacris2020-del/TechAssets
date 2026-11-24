using TechAssets.Application.DTOs.Auth;
using TechAssets.Application.DTOs.Equipos;
using TechAssets.Application.DTOs.Prestamos;
using TechAssets.Application.DTOs.Reportes;
using TechAssets.Application.DTOs.Usuarios;

namespace TechAssets.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> IniciarSesionAsync(LoginRequestDto request, CancellationToken ct = default);
    Task<AuthUserDto> ObtenerPerfilActualAsync(Guid userId, CancellationToken ct = default);
}

public interface IUsuarioService
{
    Task<IReadOnlyList<UsuarioDto>> ListarUsuariosAsync(UsuarioFilterDto filter, CancellationToken ct = default);
    Task<UsuarioDto> ObtenerUsuarioPorIdAsync(Guid id, CancellationToken ct = default);
    Task<UsuarioDto> RegistrarUsuarioAsync(CreateUsuarioDto dto, CancellationToken ct = default);
    Task<UsuarioDto> ModificarUsuarioAsync(Guid id, UpdateUsuarioDto dto, CancellationToken ct = default);
    Task<UsuarioDto> CambiarEstadoAccesoAsync(Guid id, bool activo, string actorRol, Guid actorId, CancellationToken ct = default);
}

public interface IEquipoService
{
    Task<IReadOnlyList<EquipoDto>> ListarInventarioAsync(EquipoFilterDto filter, CancellationToken ct = default);
    Task<EquipoDto> ObtenerEquipoPorIdAsync(Guid id, CancellationToken ct = default);
    Task<EquipoDto> RegistrarEquipoAsync(CreateEquipoDto dto, Guid actorId, CancellationToken ct = default);
    Task<EquipoDto> ModificarEquipoAsync(Guid id, UpdateEquipoDto dto, Guid actorId, CancellationToken ct = default);
    Task<EquipoDto> CambiarEstadoOperativoAsync(Guid id, UpdateEstadoEquipoDto dto, Guid actorId, CancellationToken ct = default);
    Task RemoverEquipoAsync(Guid id, CancellationToken ct = default);
}

public interface IPrestamoService
{
    Task<IReadOnlyList<PrestamoDto>> ListarPrestamosAsync(PrestamoFilterDto filter, Guid actorId, string actorRol, CancellationToken ct = default);
    Task<PrestamoDto> ObtenerPrestamoPorIdAsync(Guid id, Guid actorId, string actorRol, CancellationToken ct = default);
    Task<PrestamoDto> GenerarSolicitudPrestamoAsync(SolicitarPrestamoDto dto, Guid solicitanteId, CancellationToken ct = default);
    Task<PrestamoDto> AutorizarPrestamoAsync(Guid id, Guid responsableId, CancellationToken ct = default);
    Task<PrestamoDto> DenegarPrestamoAsync(Guid id, RechazarPrestamoDto dto, Guid responsableId, CancellationToken ct = default);
    Task<PrestamoDto> ProcesarDevolucionAsync(Guid id, RegistrarDevolucionDto dto, Guid responsableId, CancellationToken ct = default);
}

public interface IReporteService
{
    Task<DashboardDto> ObtenerIndicadoresGeneralesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<EquiposPorEstadoDto>> ObtenerDistribucionPorEstadoAsync(CancellationToken ct = default);
    Task<IReadOnlyList<EquipoMasUtilizadoDto>> ObtenerRankingEquiposAsync(int top = 10, CancellationToken ct = default);
    Task<IReadOnlyList<PrestamosPorAreaDto>> ObtenerMetricasPorAreaAsync(CancellationToken ct = default);
    Task<IReadOnlyList<MovimientoEquipoDto>> ObtenerBitacoraMovimientosAsync(MovimientoFilterDto filter, CancellationToken ct = default);
}
