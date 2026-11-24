using TechAssets.Application.DTOs.Equipos;
using TechAssets.Application.DTOs.Prestamos;
using TechAssets.Application.DTOs.Reportes;
using TechAssets.Application.DTOs.Usuarios;
using TechAssets.Domain.Entities;

namespace TechAssets.Application.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> BuscarPorIdAsync(Guid id, CancellationToken ct = default);
    Task<Usuario?> BuscarPorCorreoAsync(string correo, CancellationToken ct = default);
    Task<bool> VerificarCorreoExistenteAsync(string correo, Guid? excludeId = null, CancellationToken ct = default);
    Task<IReadOnlyList<Usuario>> ListarUsuariosAsync(UsuarioFilterDto filter, CancellationToken ct = default);
    Task InsertarAsync(Usuario usuario, CancellationToken ct = default);
    void Modificar(Usuario usuario);
}

public interface IEquipoRepository
{
    Task<Equipo?> BuscarPorIdAsync(Guid id, CancellationToken ct = default);
    Task<bool> VerificarCodigoExistenteAsync(string codigoPatrimonial, Guid? excludeId = null, CancellationToken ct = default);
    Task<bool> TieneHistorialPrestamosAsync(Guid equipoId, CancellationToken ct = default);
    Task<IReadOnlyList<Equipo>> ListarEquiposAsync(EquipoFilterDto filter, CancellationToken ct = default);
    Task InsertarAsync(Equipo equipo, CancellationToken ct = default);
    void Modificar(Equipo equipo);
    void Eliminar(Equipo equipo);
}

public interface IPrestamoRepository
{
    Task<Prestamo?> BuscarDetallePorIdAsync(Guid id, CancellationToken ct = default);
    Task<bool> ExistePrestamoActivoParaEquipoAsync(Guid equipoId, CancellationToken ct = default);
    Task<IReadOnlyList<Prestamo>> ListarConDetallesAsync(PrestamoFilterDto filter, CancellationToken ct = default);
    Task InsertarAsync(Prestamo prestamo, CancellationToken ct = default);
    void Modificar(Prestamo prestamo);
}

public interface IMovimientoEquipoRepository
{
    Task<IReadOnlyList<MovimientoEquipo>> ListarConDetallesAsync(MovimientoFilterDto filter, CancellationToken ct = default);
    Task InsertarAsync(MovimientoEquipo movimiento, CancellationToken ct = default);
}

public interface IUnitOfWork
{
    Task<int> ConfirmarCambiosAsync(CancellationToken ct = default);
}

public interface IPasswordHasher
{
    string EncriptarClave(string password);
    bool ValidarClave(string password, string passwordHash);
}

public interface IJwtProvider
{
    (string Token, DateTime Expiration) EmitirToken(Usuario usuario);
}
