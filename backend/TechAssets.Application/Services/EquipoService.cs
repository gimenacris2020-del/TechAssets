using TechAssets.Application.DTOs.Equipos;
using TechAssets.Application.Interfaces;
using TechAssets.Domain.Entities;
using TechAssets.Domain.Exceptions;

namespace TechAssets.Application.Services;

public class EquipoService(
    IEquipoRepository equipoRepository,
    IMovimientoEquipoRepository movimientoRepository,
    IUnitOfWork unitOfWork) : IEquipoService
{
    private static readonly string[] CategoriasValidas =
    [
        "Laptop",
        "ComputadoraEscritorio",
        "Monitor",
        "Impresora",
        "Tablet",
        "ProyectorMultimedia",
        "EquipoRed"
    ];

    private static readonly string[] EstadosValidos =
    [
        "Disponible",
        "Prestado",
        "Mantenimiento",
        "Baja"
    ];

    public async Task<IReadOnlyList<EquipoDto>> ListarInventarioAsync(EquipoFilterDto filter, CancellationToken ct = default)
    {
        var equipos = await equipoRepository.ListarEquiposAsync(filter, ct);
        return equipos.Select(ConvertirAEquipoDto).ToList();
    }

    public async Task<EquipoDto> ObtenerEquipoPorIdAsync(Guid id, CancellationToken ct = default)
    {
        var equipo = await equipoRepository.BuscarPorIdAsync(id, ct)
            ?? throw new NotFoundException("Equipo tecnológico no encontrado.");
        return ConvertirAEquipoDto(equipo);
    }

    public async Task<EquipoDto> RegistrarEquipoAsync(CreateEquipoDto dto, Guid actorId, CancellationToken ct = default)
    {
        var codigo = dto.CodigoPatrimonial.Trim().ToUpperInvariant();
        var categoria = dto.Categoria.Trim();

        if (!CategoriasValidas.Contains(categoria))
        {
            throw new BusinessRuleException($"La categoría '{categoria}' no es válida.");
        }

        // RN-07: El código patrimonial debe ser único.
        if (await equipoRepository.VerificarCodigoExistenteAsync(codigo, null, ct))
        {
            throw new ConflictException($"Ya existe un equipo con el código patrimonial '{codigo}'.");
        }

        var equipo = new Equipo
        {
            CodigoPatrimonial = codigo,
            Nombre = dto.Nombre.Trim(),
            Categoria = categoria,
            Marca = dto.Marca.Trim(),
            Ubicacion = dto.Ubicacion.Trim(),
            Estado = "Disponible",
            FechaRegistro = DateTime.UtcNow
        };

        await equipoRepository.InsertarAsync(equipo, ct);
        await movimientoRepository.InsertarAsync(new MovimientoEquipo
        {
            EquipoId = equipo.Id,
            UsuarioResponsableId = actorId,
            TipoMovimiento = "Registro",
            EstadoAnterior = null,
            EstadoNuevo = "Disponible",
            FechaMovimiento = DateTime.UtcNow,
            Detalle = $"Alta de equipo '{equipo.Nombre}' ({equipo.CodigoPatrimonial}) en {equipo.Ubicacion}."
        }, ct);

        await unitOfWork.ConfirmarCambiosAsync(ct);

        return ConvertirAEquipoDto(equipo);
    }

    public async Task<EquipoDto> ModificarEquipoAsync(Guid id, UpdateEquipoDto dto, Guid actorId, CancellationToken ct = default)
    {
        var equipo = await equipoRepository.BuscarPorIdAsync(id, ct)
            ?? throw new NotFoundException("Equipo tecnológico no encontrado.");

        var codigo = dto.CodigoPatrimonial.Trim().ToUpperInvariant();
        var categoria = dto.Categoria.Trim();

        if (!CategoriasValidas.Contains(categoria))
        {
            throw new BusinessRuleException($"La categoría '{categoria}' no es válida.");
        }

        // RN-07: El código patrimonial debe ser único.
        if (await equipoRepository.VerificarCodigoExistenteAsync(codigo, id, ct))
        {
            throw new ConflictException($"Ya existe otro equipo con el código patrimonial '{codigo}'.");
        }

        equipo.CodigoPatrimonial = codigo;
        equipo.Nombre = dto.Nombre.Trim();
        equipo.Categoria = categoria;
        equipo.Marca = dto.Marca.Trim();
        equipo.Ubicacion = dto.Ubicacion.Trim();

        equipoRepository.Modificar(equipo);
        await movimientoRepository.InsertarAsync(new MovimientoEquipo
        {
            EquipoId = equipo.Id,
            UsuarioResponsableId = actorId,
            TipoMovimiento = "Actualizacion",
            EstadoAnterior = equipo.Estado,
            EstadoNuevo = equipo.Estado,
            FechaMovimiento = DateTime.UtcNow,
            Detalle = $"Actualización de datos del equipo '{equipo.Nombre}' ({equipo.CodigoPatrimonial})."
        }, ct);

        await unitOfWork.ConfirmarCambiosAsync(ct);

        return ConvertirAEquipoDto(equipo);
    }

    public async Task<EquipoDto> CambiarEstadoOperativoAsync(Guid id, UpdateEstadoEquipoDto dto, Guid actorId, CancellationToken ct = default)
    {
        var equipo = await equipoRepository.BuscarPorIdAsync(id, ct)
            ?? throw new NotFoundException("Equipo tecnológico no encontrado.");

        var nuevoEstado = dto.Estado.Trim();
        if (!EstadosValidos.Contains(nuevoEstado))
        {
            throw new BusinessRuleException($"El estado '{nuevoEstado}' no es válido.");
        }

        if (equipo.Estado == "Prestado" && nuevoEstado != "Prestado")
        {
            throw new BusinessRuleException("No se puede cambiar manualmente el estado de un equipo que tiene un préstamo activo. Registre primero la devolución.");
        }

        if (nuevoEstado == "Prestado" && equipo.Estado != "Prestado")
        {
            throw new BusinessRuleException("El estado 'Prestado' solo puede asignarse al aprobar un préstamo.");
        }

        var estadoAnterior = equipo.Estado;
        if (estadoAnterior == nuevoEstado)
        {
            return ConvertirAEquipoDto(equipo);
        }

        equipo.Estado = nuevoEstado;
        equipoRepository.Modificar(equipo);

        var motivo = string.IsNullOrWhiteSpace(dto.Motivo) ? "Sin motivo especificado." : dto.Motivo.Trim();
        await movimientoRepository.InsertarAsync(new MovimientoEquipo
        {
            EquipoId = equipo.Id,
            UsuarioResponsableId = actorId,
            TipoMovimiento = "CambioEstado",
            EstadoAnterior = estadoAnterior,
            EstadoNuevo = nuevoEstado,
            FechaMovimiento = DateTime.UtcNow,
            Detalle = $"Cambio de estado de {estadoAnterior} a {nuevoEstado}. {motivo}"
        }, ct);

        await unitOfWork.ConfirmarCambiosAsync(ct);

        return ConvertirAEquipoDto(equipo);
    }

    public async Task RemoverEquipoAsync(Guid id, CancellationToken ct = default)
    {
        var equipo = await equipoRepository.BuscarPorIdAsync(id, ct)
            ?? throw new NotFoundException("Equipo tecnológico no encontrado.");

        // RN-06: No se puede eliminar un equipo con historial de préstamos.
        if (await equipoRepository.TieneHistorialPrestamosAsync(id, ct))
        {
            throw new ConflictException("No se puede eliminar un equipo que cuenta con historial de préstamos. Considere cambiar su estado a 'Baja'.");
        }

        equipoRepository.Eliminar(equipo);
        await unitOfWork.ConfirmarCambiosAsync(ct);
    }

    private static EquipoDto ConvertirAEquipoDto(Equipo equipo) => new()
    {
        Id = equipo.Id,
        CodigoPatrimonial = equipo.CodigoPatrimonial,
        Nombre = equipo.Nombre,
        Categoria = equipo.Categoria,
        Marca = equipo.Marca,
        Ubicacion = equipo.Ubicacion,
        Estado = equipo.Estado,
        FechaRegistro = equipo.FechaRegistro
    };
}
