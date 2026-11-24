using TechAssets.Application.Interfaces;

namespace TechAssets.Infrastructure.Auth;

public class PasswordHasher : IPasswordHasher
{
    public string EncriptarClave(string password) => BCrypt.Net.BCrypt.HashPassword(password);

    public bool ValidarClave(string password, string passwordHash) => BCrypt.Net.BCrypt.Verify(password, passwordHash);
}
