using TechAssets.Application.Interfaces;
using TechAssets.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace TechAssets.Infrastructure.Persistence;

/// <summary>
/// Carga datos iniciales de prueba con los usuarios corporativos y el catálogo base de equipos.
/// </summary>
public static class DbSeeder
{
    public static async Task InicializarDatosBaseAsync(AppDbContext context, IPasswordHasher passwordHasher)
    {
        var nuevosUsuarios = new List<Usuario>
        {
            new()
            {
                Id = Guid.Parse("a1000001-0001-4000-8000-000000000001"),
                Nombres = "Sebastián",
                Apellidos = "Valdivia",
                Correo = "svaldivia@innovatech.com",
                PasswordHash = passwordHasher.EncriptarClave("Admin2026!"),
                Area = "Dirección de Sistemas",
                Rol = "Administrador",
                Estado = true,
                FechaCreacion = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("a2000002-0002-4000-8000-000000000002"),
                Nombres = "Valeria",
                Apellidos = "Salazar",
                Correo = "vsalazar@innovatech.com",
                PasswordHash = passwordHasher.EncriptarClave("Tecno2026!"),
                Area = "Infraestructura y Soporte TI",
                Rol = "ResponsableTecnologia",
                Estado = true,
                FechaCreacion = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("a3000003-0003-4000-8000-000000000003"),
                Nombres = "Mateo",
                Apellidos = "Gutiérrez",
                Correo = "mgutierrez@innovatech.com",
                PasswordHash = passwordHasher.EncriptarClave("Colab2026!"),
                Area = "Ingeniería de Producto",
                Rol = "Colaborador",
                Estado = true,
                FechaCreacion = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("a4000004-0004-4000-8000-000000000004"),
                Nombres = "Camila",
                Apellidos = "Paredes",
                Correo = "cparedes@innovatech.com",
                PasswordHash = passwordHasher.EncriptarClave("Colab2026!"),
                Area = "Analítica de Datos",
                Rol = "Colaborador",
                Estado = true,
                FechaCreacion = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("a5000005-0005-4000-8000-000000000005"),
                Nombres = "Renato",
                Apellidos = "Alarcón",
                Correo = "ralarcon@innovatech.com",
                PasswordHash = passwordHasher.EncriptarClave("Tecno2026!"),
                Area = "Operaciones Cloud",
                Rol = "ResponsableTecnologia",
                Estado = true,
                FechaCreacion = DateTime.UtcNow
            }
        };

        var correosAntiguos = new[] { "admin@innovatech.com", "responsable@innovatech.com", "colaborador@innovatech.com" };
        var usuariosAntiguos = await context.Usuarios
            .Where(u => correosAntiguos.Contains(u.Correo))
            .ToListAsync();

        foreach (var antiguo in usuariosAntiguos)
        {
            var tienePrestamos = await context.Prestamos.AnyAsync(p => p.UsuarioId == antiguo.Id || p.ResponsableId == antiguo.Id);
            if (!tienePrestamos)
            {
                var movs = await context.MovimientosEquipos
                    .Where(m => m.UsuarioResponsableId == antiguo.Id)
                    .ToListAsync();
                foreach (var mov in movs)
                {
                    mov.UsuarioResponsableId = null;
                }
                context.Usuarios.Remove(antiguo);
            }
        }

        foreach (var nuevo in nuevosUsuarios)
        {
            var existe = await context.Usuarios.AnyAsync(u => u.Correo == nuevo.Correo || u.Id == nuevo.Id);
            if (!existe)
            {
                await context.Usuarios.AddAsync(nuevo);
            }
        }

        await context.SaveChangesAsync();

        if (await context.Equipos.AnyAsync())
        {
            return;
        }

        var adminPrincipal = await context.Usuarios.FirstOrDefaultAsync(u => u.Rol == "Administrador")
            ?? nuevosUsuarios[0];

        var equipos = new List<Equipo>
        {
            new()
            {
                CodigoPatrimonial = "INV-LAP-001",
                Nombre = "ThinkPad T14 Gen 4",
                Categoria = "Laptop",
                Marca = "Lenovo",
                Ubicacion = "Almacén TI - Piso 3",
                Estado = "Disponible"
            },
            new()
            {
                CodigoPatrimonial = "INV-LAP-002",
                Nombre = "Latitude 5440",
                Categoria = "Laptop",
                Marca = "Dell",
                Ubicacion = "Almacén TI - Piso 3",
                Estado = "Disponible"
            },
            new()
            {
                CodigoPatrimonial = "INV-MON-001",
                Nombre = "UltraSharp U2723QE 27\"",
                Categoria = "Monitor",
                Marca = "Dell",
                Ubicacion = "Almacén TI - Piso 3",
                Estado = "Disponible"
            },
            new()
            {
                CodigoPatrimonial = "INV-PRO-001",
                Nombre = "PowerLite E20",
                Categoria = "ProyectorMultimedia",
                Marca = "Epson",
                Ubicacion = "Sala de Reuniones B",
                Estado = "Mantenimiento"
            },
            new()
            {
                CodigoPatrimonial = "INV-TAB-001",
                Nombre = "iPad Air M2",
                Categoria = "Tablet",
                Marca = "Apple",
                Ubicacion = "Almacén TI - Piso 2",
                Estado = "Disponible"
            },
            new()
            {
                CodigoPatrimonial = "INV-RED-001",
                Nombre = "Catalyst 2960-X",
                Categoria = "EquipoRed",
                Marca = "Cisco",
                Ubicacion = "Data Center",
                Estado = "Disponible"
            }
        };

        await context.Equipos.AddRangeAsync(equipos);

        var movimientos = equipos.Select(e => new MovimientoEquipo
        {
            EquipoId = e.Id,
            UsuarioResponsableId = adminPrincipal.Id,
            TipoMovimiento = "Registro",
            EstadoAnterior = null,
            EstadoNuevo = e.Estado,
            FechaMovimiento = DateTime.UtcNow,
            Detalle = $"Carga inicial de inventario: '{e.Nombre}' ({e.CodigoPatrimonial})."
        });

        await context.MovimientosEquipos.AddRangeAsync(movimientos);
        await context.SaveChangesAsync();
    }
}
