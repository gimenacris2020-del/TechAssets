using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TechAssets.Application.Interfaces;
using TechAssets.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace TechAssets.Infrastructure.Auth;

public class JwtProvider(IConfiguration configuration) : IJwtProvider
{
    public (string Token, DateTime Expiration) EmitirToken(Usuario usuario)
    {
        var key = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("No se ha configurado 'Jwt:Key' en appsettings.");
        var issuer = configuration["Jwt:Issuer"] ?? "TechAssets";
        var audience = configuration["Jwt:Audience"] ?? "TechAssets.Client";
        var expirationMinutes = int.TryParse(configuration["Jwt:ExpirationMinutes"], out var mins) ? mins : 480;

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, usuario.Correo),
            new(ClaimTypes.Name, $"{usuario.Nombres} {usuario.Apellidos}".Trim()),
            new(ClaimTypes.Role, usuario.Rol),
            new("area", usuario.Area)
        };

        var expiration = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiration,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiration);
    }
}
