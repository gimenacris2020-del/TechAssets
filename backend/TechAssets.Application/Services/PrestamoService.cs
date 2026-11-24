using TechAssets.Application.DTOs.Prestamos;
using TechAssets.Application.Interfaces;
using TechAssets.Domain.Entities;
using TechAssets.Domain.Exceptions;

namespace TechAssets.Application.Services;

public class PrestamoService(
    IPrestamoRepository prestamoRepository,
    IEquipoRepository equipoRepository,
    IUsuarioRepository usuarioRepository,
    IMovimientoEquipoRepository movimientoRepository,
    IUnitOfWork unitOfWork) : IPrestamoService
{
    public async Task<IReadOnlyList<PrestamoDto>> ListarPrestamosAsync(
        PrestamoFilterDto filter,
        Guid actorId,
        string actorRol,
        CancellationToken ct = default)
    {
        if (actorRol == "Colaborador")
        {
            filter.UsuarioId = actorId;
        }

        var prestamos = await prestamoRepository.ListarConDetallesAsync(filter, ct);
        return prestamos.Select(ConvertirAPrestamoDto).ToList();
    }

    public async Task<PrestamoDto> ObtenerPrestamoPorIdAsync(Guid id, Guid actorId, string actorRol, CancellationToken ct = default)
    {
        var prestamo = await prestamoRepository.BuscarDetallePorIdAsync(id, ct)
            ?? throw new NotFoundException("Préstamo no encontrado.");

        if (actorRol == "Colaborador" && prestamo.UsuarioId != actorId)
        {
            throw new ForbiddenException("No tiene permisos para consultar el préstamo de otro colaborador.");
        }

        return ConvertirAPrestamoDto(prestamo);
    }

    public async Task<PrestamoDto> GenerarSolicitudPrestamoAsync(SolicitarPrestamoDto dto, Guid solicitanteId, CancellationToken ct = default)
    {
        var solicitante = await usuarioRepository.BuscarPorIdAsync(solicitanteId, ct)
            ?? throw new NotFoundException("Usuario solicitante no encontrado.");

        if (!solicitante.Estado)
        {
            throw new ForbiddenException("Un usuario deshabilitado no puede solicitar préstamos.");
        }

        var equipo = await equipoRepository.BuscarPorIdAsync(dto.EquipoId, ct)
            ?? throw new NotFoundException("Equipo tecnológico no encontrado.");

        VerificarAptitudParaPrestamo(equipo);

        // RN-01: Un equipo solo puede estar asociado a un préstamo activo.
        if (await prestamoRepository.ExistePrestamoActivoParaEquipoAsync(equipo.Id, ct))
        {
            throw new ConflictException("El equipo seleccionado ya se encuentra asociado a un préstamo activo.");
        }

        var fechaPrestamo = AjustarAUltimoUtc(dto.FechaPrestamo);
        var fechaDevolucionEstimada = AjustarAUltimoUtc(dto.FechaDevolucionEstimada);

        if (fechaPrestamo.ToLocalTime().Date < DateTime.Today)
        {
            throw new BusinessRuleException("La fecha de préstamo no puede ser anterior al día de hoy.");
        }

        // RN-04: La fecha de devolución debe ser posterior a la fecha de préstamo.
        if (fechaDevolucionEstimada <= fechaPrestamo)
        {
            throw new BusinessRuleException("La fecha estimada de devolución debe ser posterior a la fecha de préstamo.");
        }

        var prestamo = new Prestamo
        {
            FechaSolicitud = DateTime.UtcNow,
            FechaPrestamo = fechaPrestamo,
            FechaDevolucionEstimada = fechaDevolucionEstimada,
            Estado = "Pendiente",
            Observacion = string.IsNullOrWhiteSpace(dto.Observacion) ? null : dto.Observacion.Trim(),
            UsuarioId = solicitanteId,
            EquipoId = equipo.Id
        };

        await prestamoRepository.InsertarAsync(prestamo, ct);
        await unitOfWork.ConfirmarCambiosAsync(ct);

        var creado = await prestamoRepository.BuscarDetallePorIdAsync(prestamo.Id, ct)
            ?? throw new NotFoundException("Error al recuperar la solicitud de préstamo.");

        return ConvertirAPrestamoDto(creado);
    }

    public async Task<PrestamoDto> AutorizarPrestamoAsync(Guid id, Guid responsableId, CancellationToken ct = default)
    {
        // RN-05: Todo préstamo debe registrar un responsable.
        var responsable = await usuarioRepository.BuscarPorIdAsync(responsableId, ct)
            ?? throw new NotFoundException("Usuario responsable no encontrado.");

        if (!responsable.Estado)
        {
            throw new ForbiddenException("Un responsable deshabilitado no puede aprobar préstamos.");
        }

        var prestamo = await prestamoRepository.BuscarDetallePorIdAsync(id, ct)
            ?? throw new NotFoundException("Solicitud de préstamo no encontrada.");

        if (prestamo.Estado != "Pendiente")
        {
            throw new BusinessRuleException($"Solo se pueden aprobar solicitudes en estado 'Pendiente'. Estado actual: {prestamo.Estado}.");
        }

        var equipo = await equipoRepository.BuscarPorIdAsync(prestamo.EquipoId, ct)
            ?? throw new NotFoundException("Equipo asociado no encontrado.");

        VerificarAptitudParaPrestamo(equipo);

        // RN-01: Un equipo solo puede estar asociado a un préstamo activo.
        if (await prestamoRepository.ExistePrestamoActivoParaEquipoAsync(equipo.Id, ct))
        {
            throw new ConflictException("El equipo ya cuenta con un préstamo activo.");
        }

        var estadoAnterior = equipo.Estado;
        equipo.Estado = "Prestado";

        prestamo.Estado = "Activo";
        prestamo.ResponsableId = responsableId;
        if (prestamo.FechaPrestamo < DateTime.UtcNow.AddMinutes(-5))
        {
            if (prestamo.FechaDevolucionEstimada <= DateTime.UtcNow)
            {
                throw new BusinessRuleException("La fecha estimada de devolución ya expiró y debe ser posterior a la fecha actual.");
            }
        }

        equipoRepository.Modificar(equipo);
        prestamoRepository.Modificar(prestamo);

        await movimientoRepository.InsertarAsync(new MovimientoEquipo
        {
            EquipoId = equipo.Id,
            UsuarioResponsableId = responsableId,
            TipoMovimiento = "PrestamoAprobado",
            EstadoAnterior = estadoAnterior,
            EstadoNuevo = "Prestado",
            FechaMovimiento = DateTime.UtcNow,
            Detalle = $"Préstamo aprobado para {prestamo.Usuario.Nombres} {prestamo.Usuario.Apellidos} ({prestamo.Usuario.Area})."
        }, ct);

        await unitOfWork.ConfirmarCambiosAsync(ct);

        var actualizado = await prestamoRepository.BuscarDetallePorIdAsync(prestamo.Id, ct)!;
        return ConvertirAPrestamoDto(actualizado!);
    }

    public async Task<PrestamoDto> DenegarPrestamoAsync(Guid id, RechazarPrestamoDto dto, Guid responsableId, CancellationToken ct = default)
    {
        var prestamo = await prestamoRepository.BuscarDetallePorIdAsync(id, ct)
            ?? throw new NotFoundException("Solicitud de préstamo no encontrada.");

        if (prestamo.Estado != "Pendiente")
        {
            throw new BusinessRuleException($"Solo se pueden rechazar solicitudes en estado 'Pendiente'. Estado actual: {prestamo.Estado}.");
        }

        prestamo.Estado = "Rechazado";
        prestamo.ResponsableId = responsableId;
        prestamo.ObservacionDevolucion = $"Solicitud rechazada: {dto.Motivo.Trim()}";

        prestamoRepository.Modificar(prestamo);
        await unitOfWork.ConfirmarCambiosAsync(ct);

        var actualizado = await prestamoRepository.BuscarDetallePorIdAsync(prestamo.Id, ct)!;
        return ConvertirAPrestamoDto(actualizado!);
    }

    public async Task<PrestamoDto> ProcesarDevolucionAsync(
        Guid id,
        RegistrarDevolucionDto dto,
        Guid responsableId,
        CancellationToken ct = default)
    {
        // RN-10: Toda devolución deberá registrar observaciones.
        if (string.IsNullOrWhiteSpace(dto.ObservacionDevolucion))
        {
            throw new BusinessRuleException("Toda devolución debe registrar observaciones.");
        }

        var prestamo = await prestamoRepository.BuscarDetallePorIdAsync(id, ct)
            ?? throw new NotFoundException("Préstamo no encontrado.");

        if (prestamo.Estado != "Activo")
        {
            throw new BusinessRuleException("Solo se puede registrar la devolución de un préstamo que se encuentre en estado 'Activo'.");
        }

        var fechaDevolucion = AjustarAUltimoUtc(dto.FechaDevolucion);

        // RN-04: La fecha de devolución debe ser posterior a la fecha de préstamo.
        if (fechaDevolucion <= prestamo.FechaPrestamo)
        {
            throw new BusinessRuleException("La fecha de devolución debe ser posterior a la fecha de préstamo.");
        }

        var equipo = await equipoRepository.BuscarPorIdAsync(prestamo.EquipoId, ct)
            ?? throw new NotFoundException("Equipo asociado no encontrado.");

        var estadoAnterior = equipo.Estado;
        var nuevoEstadoEquipo = dto.EnviarAMantenimiento ? "Mantenimiento" : "Disponible";

        equipo.Estado = nuevoEstadoEquipo;
        prestamo.Estado = "Devuelto";
        prestamo.FechaDevolucion = fechaDevolucion;
        prestamo.ObservacionDevolucion = dto.ObservacionDevolucion.Trim();
        prestamo.ResponsableId ??= responsableId;

        equipoRepository.Modificar(equipo);
        prestamoRepository.Modificar(prestamo);

        await movimientoRepository.InsertarAsync(new MovimientoEquipo
        {
            EquipoId = equipo.Id,
            UsuarioResponsableId = responsableId,
            TipoMovimiento = "Devolucion",
            EstadoAnterior = estadoAnterior,
            EstadoNuevo = nuevoEstadoEquipo,
            FechaMovimiento = DateTime.UtcNow,
            Detalle = $"Devolución registrada por {prestamo.Usuario.Nombres} {prestamo.Usuario.Apellidos}. Obs: {prestamo.ObservacionDevolucion}"
        }, ct);

        await unitOfWork.ConfirmarCambiosAsync(ct);

        var actualizado = await prestamoRepository.BuscarDetallePorIdAsync(prestamo.Id, ct)!;
        return ConvertirAPrestamoDto(actualizado!);
    }

    private static void VerificarAptitudParaPrestamo(Equipo equipo)
    {
        // RN-02: No se puede prestar un equipo en estado “Mantenimiento”.
        if (equipo.Estado == "Mantenimiento")
        {
            throw new BusinessRuleException("No se puede prestar un equipo que se encuentra en estado 'Mantenimiento'.");
        }

        // RN-03: No se puede prestar un equipo en estado “Baja”.
        if (equipo.Estado == "Baja")
        {
            throw new BusinessRuleException("No se puede prestar un equipo que se encuentra en estado 'Baja'.");
        }

        if (equipo.Estado == "Prestado")
        {
            throw new ConflictException("El equipo se encuentra actualmente en estado 'Prestado'.");
        }
    }

    private static DateTime AjustarAUltimoUtc(DateTime dateTime) => dateTime.Kind switch
    {
        DateTimeKind.Utc => dateTime,
        DateTimeKind.Local => dateTime.ToUniversalTime(),
        _ => DateTime.SpecifyKind(dateTime, DateTimeKind.Utc)
    };

    private static PrestamoDto ConvertirAPrestamoDto(Prestamo prestamo) => new()
    {
        Id = prestamo.Id,
        FechaSolicitud = prestamo.FechaSolicitud,
        FechaPrestamo = prestamo.FechaPrestamo,
        FechaDevolucionEstimada = prestamo.FechaDevolucionEstimada,
        FechaDevolucion = prestamo.FechaDevolucion,
        Estado = prestamo.Estado,
        Observacion = prestamo.Observacion,
        ObservacionDevolucion = prestamo.ObservacionDevolucion,
        UsuarioId = prestamo.UsuarioId,
        UsuarioNombre = $"{prestamo.Usuario.Nombres} {prestamo.Usuario.Apellidos}".Trim(),
        UsuarioArea = prestamo.Usuario.Area,
        ResponsableId = prestamo.ResponsableId,
        ResponsableNombre = prestamo.Responsable is null
            ? null
            : $"{prestamo.Responsable.Nombres} {prestamo.Responsable.Apellidos}".Trim(),
        EquipoId = prestamo.EquipoId,
        EquipoCodigoPatrimonial = prestamo.Equipo.CodigoPatrimonial,
        EquipoNombre = prestamo.Equipo.Nombre,
        EquipoCategoria = prestamo.Equipo.Categoria
    };
}
