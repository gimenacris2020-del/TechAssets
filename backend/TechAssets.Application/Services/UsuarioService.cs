using TechAssets.Application.DTOs.Usuarios;
using TechAssets.Application.Interfaces;
using TechAssets.Domain.Entities;
using TechAssets.Domain.Exceptions;

namespace TechAssets.Application.Services;

public class UsuarioService(
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher,
    IUnitOfWork unitOfWork) : IUsuarioService
{
    private static readonly string[] RolesValidos =
    [
        "Administrador",
        "ResponsableTecnologia",
        "Colaborador"
    ];

    public async Task<IReadOnlyList<UsuarioDto>> ListarUsuariosAsync(UsuarioFilterDto filter, CancellationToken ct = default)
    {
        var usuarios = await usuarioRepository.ListarUsuariosAsync(filter, ct);
        return usuarios.Select(ConvertirAUsuarioDto).ToList();
    }

    public async Task<UsuarioDto> ObtenerUsuarioPorIdAsync(Guid id, CancellationToken ct = default)
    {
        var usuario = await usuarioRepository.BuscarPorIdAsync(id, ct)
            ?? throw new NotFoundException("Usuario no encontrado.");
        return ConvertirAUsuarioDto(usuario);
    }

    public async Task<UsuarioDto> RegistrarUsuarioAsync(CreateUsuarioDto dto, CancellationToken ct = default)
    {
        var correo = dto.Correo.Trim().ToLowerInvariant();
        var rol = dto.Rol.Trim();

        if (!RolesValidos.Contains(rol))
        {
            throw new BusinessRuleException($"El rol '{rol}' no es válido.");
        }

        // RN-08: El correo electrónico del usuario debe ser único.
        if (await usuarioRepository.VerificarCorreoExistenteAsync(correo, null, ct))
        {
            throw new ConflictException($"Ya existe un usuario registrado con el correo '{correo}'.");
        }

        var usuario = new Usuario
        {
            Nombres = dto.Nombres.Trim(),
            Apellidos = dto.Apellidos.Trim(),
            Correo = correo,
            PasswordHash = passwordHasher.EncriptarClave(dto.Password),
            Area = dto.Area.Trim(),
            Rol = rol,
            Estado = true,
            FechaCreacion = DateTime.UtcNow
        };

        await usuarioRepository.InsertarAsync(usuario, ct);
        await unitOfWork.ConfirmarCambiosAsync(ct);

        return ConvertirAUsuarioDto(usuario);
    }

    public async Task<UsuarioDto> ModificarUsuarioAsync(Guid id, UpdateUsuarioDto dto, CancellationToken ct = default)
    {
        var usuario = await usuarioRepository.BuscarPorIdAsync(id, ct)
            ?? throw new NotFoundException("Usuario no encontrado.");

        var correo = dto.Correo.Trim().ToLowerInvariant();
        var rol = dto.Rol.Trim();

        if (!RolesValidos.Contains(rol))
        {
            throw new BusinessRuleException($"El rol '{rol}' no es válido.");
        }

        // RN-08: El correo electrónico del usuario debe ser único.
        if (await usuarioRepository.VerificarCorreoExistenteAsync(correo, id, ct))
        {
            throw new ConflictException($"Ya existe otro usuario registrado con el correo '{correo}'.");
        }

        usuario.Nombres = dto.Nombres.Trim();
        usuario.Apellidos = dto.Apellidos.Trim();
        usuario.Correo = correo;
        usuario.Area = dto.Area.Trim();
        usuario.Rol = rol;

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            usuario.PasswordHash = passwordHasher.EncriptarClave(dto.Password);
        }

        usuarioRepository.Modificar(usuario);
        await unitOfWork.ConfirmarCambiosAsync(ct);

        return ConvertirAUsuarioDto(usuario);
    }

    public async Task<UsuarioDto> CambiarEstadoAccesoAsync(
        Guid id,
        bool activo,
        string actorRol,
        Guid actorId,
        CancellationToken ct = default)
    {
        // RN-09: Solo el Administrador podrá deshabilitar usuarios.
        if (actorRol != "Administrador")
        {
            throw new ForbiddenException("Solo el Administrador puede habilitar o deshabilitar usuarios.");
        }

        if (!activo && id == actorId)
        {
            throw new BusinessRuleException("No puedes deshabilitar tu propia cuenta de Administrador mientras estás autenticado.");
        }

        var usuario = await usuarioRepository.BuscarPorIdAsync(id, ct)
            ?? throw new NotFoundException("Usuario no encontrado.");

        usuario.Estado = activo;
        usuarioRepository.Modificar(usuario);
        await unitOfWork.ConfirmarCambiosAsync(ct);

        return ConvertirAUsuarioDto(usuario);
    }

    private static UsuarioDto ConvertirAUsuarioDto(Usuario usuario) => new()
    {
        Id = usuario.Id,
        Nombres = usuario.Nombres,
        Apellidos = usuario.Apellidos,
        NombreCompleto = $"{usuario.Nombres} {usuario.Apellidos}".Trim(),
        Correo = usuario.Correo,
        Area = usuario.Area,
        Rol = usuario.Rol,
        Estado = usuario.Estado,
        FechaCreacion = usuario.FechaCreacion
    };
}
