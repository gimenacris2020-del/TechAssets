import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/components/shared/AuthProvider'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { ToastProvider } from '@/components/shared/ToastProvider'
import { MainLayout } from '@/layouts/MainLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { EquiposPage } from '@/pages/EquiposPage'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { NuevoEquipoPage } from '@/pages/NuevoEquipoPage'
import { NuevoPrestamoPage } from '@/pages/NuevoPrestamoPage'
import { NuevoUsuarioPage } from '@/pages/NuevoUsuarioPage'
import { PrestamosPage } from '@/pages/PrestamosPage'
import { RegistrarDevolucionPage } from '@/pages/RegistrarDevolucionPage'
import { ReportesPage } from '@/pages/ReportesPage'
import { UsuariosPage } from '@/pages/UsuariosPage'

export function App() {
  return (
    <TooltipProvider delayDuration={150}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/equipos" element={<EquiposPage />} />
                  <Route path="/prestamos" element={<PrestamosPage />} />
                  <Route path="/prestamos/nuevo" element={<NuevoPrestamoPage />} />

                  <Route
                    element={<ProtectedRoute allowedRoles={['Administrador', 'ResponsableTecnologia']} />}
                  >
                    <Route path="/equipos/nuevo" element={<NuevoEquipoPage />} />
                    <Route path="/prestamos/:id/devolver" element={<RegistrarDevolucionPage />} />
                    <Route path="/reportes" element={<ReportesPage />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
                    <Route path="/usuarios" element={<UsuariosPage />} />
                    <Route path="/usuarios/nuevo" element={<NuevoUsuarioPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </TooltipProvider>
  )
}

export default App
