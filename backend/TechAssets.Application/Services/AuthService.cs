using TechAssets.Application.DTOs.Auth;
using TechAssets.Application.Interfaces;
using TechAssets.Domain.Exceptions;

namespace TechAssets.Application.Services;

public class AuthService(
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher,
    IJwtProvider jwtProvider) : IAuthService
{
    public async Task<LoginResponseDto> IniciarSesionAsync(LoginRequestDto request, CancellationToken ct = default)
    {
        var correoNormalizado = request.Correo.Trim().ToLowerInvariant();
        var usuario = await usuarioRepository.BuscarPorCorreoAsync(correoNormalizado, ct);

        if (usuario is null || !passwordHasher.ValidarClave(request.Password, usuario.PasswordHash))
        {
            throw new UnauthorizedException("Correo electrónico o contraseña incorrectos.");
        }

        if (!usuario.Estado)
        {
            throw new ForbiddenException("Su cuenta se encuentra deshabilitada. Contacte al Administrador.");
        }

        var (token, expiration) = jwtProvider.EmitirToken(usuario);

        return new LoginResponseDto
        {
            Token = token,
            Expiration = expiration,
            Usuario = ConstruirPerfilDto(usuario)
        };
    }

    public async Task<AuthUserDto> ObtenerPerfilActualAsync(Guid userId, CancellationToken ct = default)
    {
        var usuario = await usuarioRepository.BuscarPorIdAsync(userId, ct)
            ?? throw new NotFoundException("Usuario no encontrado.");

        if (!usuario.Estado)
        {
            throw new ForbiddenException("Su cuenta se encuentra deshabilitada.");
        }

        return ConstruirPerfilDto(usuario);
    }

    private static AuthUserDto ConstruirPerfilDto(Domain.Entities.Usuario usuario) => new()
    {
        Id = usuario.Id,
        Nombres = usuario.Nombres,
        Apellidos = usuario.Apellidos,
        Correo = usuario.Correo,
        Area = usuario.Area,
        Rol = usuario.Rol,
        Estado = usuario.Estado
    };
}
