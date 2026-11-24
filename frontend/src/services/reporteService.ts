import type {
  DashboardData,
  EquipoMasUtilizado,
  EquiposPorEstado,
  MovimientoEquipo,
  PrestamosPorArea,
} from '@/services/types'
import { apiRequest, buildQueryString } from './api'

export interface MovimientoFilters {
  search?: string
  tipoMovimiento?: string
  equipoId?: string
}

export const reporteService = {
  consultarIndicadores: () => apiRequest<DashboardData>('/reportes/dashboard'),
  consultarDistribucionEstados: () => apiRequest<EquiposPorEstado[]>('/reportes/equipos-por-estado'),
  consultarRankingEquipos: (top = 10) =>
    apiRequest<EquipoMasUtilizado[]>(`/reportes/equipos-mas-utilizados?top=${top}`),
  consultarMetricasAreas: () => apiRequest<PrestamosPorArea[]>('/reportes/prestamos-por-area'),
  consultarBitacoraMovimientos: (filters: MovimientoFilters = {}) =>
    apiRequest<MovimientoEquipo[]>(`/reportes/movimientos${buildQueryString(filters as Record<string, string | undefined>)}`),
}
