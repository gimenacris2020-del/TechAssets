import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Cpu, MapPin, Save, Sparkles, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { FormField } from '@/components/shared/FormField'
import { useToast } from '@/components/shared/ToastProvider'
import { equipoService } from '@/services/equipoService'
import { CATEGORIA_LABELS, CATEGORIAS_EQUIPO } from '@/services/types'

export function NuevoEquipoPage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const [codigoPatrimonial, setCodigoPatrimonial] = useState('')
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState<string>('Laptop')
  const [marca, setMarca] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validarDatosActivo = () => {
    const nextErrors: Record<string, string> = {}
    if (!codigoPatrimonial.trim()) {
      nextErrors.codigoPatrimonial = 'El código patrimonial es obligatorio.'
    }
    if (!nombre.trim()) {
      nextErrors.nombre = 'El nombre o modelo del equipo es obligatorio.'
    }
    if (!marca.trim()) {
      nextErrors.marca = 'La marca del fabricante es obligatoria.'
    }
    if (!ubicacion.trim()) {
      nextErrors.ubicacion = 'La ubicación física es obligatoria.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const registrarActivoTecnologico = async (e: FormEvent) => {
    e.preventDefault()
    if (!validarDatosActivo()) return

    setIsSubmitting(true)
    try {
      const payload = {
        codigoPatrimonial: codigoPatrimonial.trim().toUpperCase(),
        nombre: nombre.trim(),
        categoria,
        marca: marca.trim(),
        ubicacion: ubicacion.trim(),
      }

      await equipoService.registrarActivo(payload)
      showSuccess(
        'Equipo registrado en inventario',
        `El activo ${payload.codigoPatrimonial} fue dado de alta y fuiste redirigido al catálogo.`,
      )
      navigate('/equipos', { replace: true })
    } catch (err) {
      showError('No se pudo registrar el equipo', err instanceof Error ? err.message : undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-purple-200/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-0.5 text-xs font-extrabold text-purple-800">
            <Sparkles className="h-3.5 w-3.5" />
            Alta Patrimonial
          </span>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight">
            Registrar Nuevo Equipo Tecnológico
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Completa la ficha técnica del activo. Al guardar serás redirigido al catálogo de equipos.
          </p>
        </div>

        <Link to="/equipos">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Volver al Catálogo
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <Card className="overflow-hidden rounded-3xl border-purple-200/80">
          <div className="h-1.5 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600" />
          <CardHeader>
            <CardTitle>Especificaciones del Activo</CardTitle>
            <CardDescription>
              Todo nuevo equipo ingresa automáticamente con estado operativo Disponible y genera un registro en la bitácora.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={registrarActivoTecnologico} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Código Patrimonial Único"
                  htmlFor="eq-codigo"
                  error={errors.codigoPatrimonial}
                  required
                >
                  <Input
                    id="eq-codigo"
                    value={codigoPatrimonial}
                    onChange={(e) => {
                      setCodigoPatrimonial(e.target.value)
                      setErrors((prev) => ({ ...prev, codigoPatrimonial: '' }))
                    }}
                    placeholder="Ej. INV-LAP-015"
                  />
                </FormField>

                <FormField label="Categoría Tecnológica" htmlFor="eq-categoria" required>
                  <Select
                    id="eq-categoria"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                  >
                    {CATEGORIAS_EQUIPO.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORIA_LABELS[cat]}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <FormField
                label="Nombre o Modelo del Equipo"
                htmlFor="eq-nombre"
                error={errors.nombre}
                required
              >
                <Input
                  id="eq-nombre"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value)
                    setErrors((prev) => ({ ...prev, nombre: '' }))
                  }}
                  placeholder="Ej. MacBook Pro 14 M3 / ThinkPad T14 Gen 4"
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Marca / Fabricante" htmlFor="eq-marca" error={errors.marca} required>
                  <Input
                    id="eq-marca"
                    value={marca}
                    onChange={(e) => {
                      setMarca(e.target.value)
                      setErrors((prev) => ({ ...prev, marca: '' }))
                    }}
                    placeholder="Ej. Lenovo, Dell, Apple, Cisco"
                  />
                </FormField>

                <FormField
                  label="Ubicación Física"
                  htmlFor="eq-ubicacion"
                  error={errors.ubicacion}
                  required
                >
                  <Input
                    id="eq-ubicacion"
                    value={ubicacion}
                    onChange={(e) => {
                      setUbicacion(e.target.value)
                      setErrors((prev) => ({ ...prev, ubicacion: '' }))
                    }}
                    placeholder="Ej. Almacén TI - Piso 3"
                  />
                </FormField>
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-border pt-4 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/equipos')}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Guardando activo...' : 'Confirmar y registrar equipo'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="rounded-3xl bg-gradient-to-br from-[#190a36] via-[#2c1259] to-[#170930] p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-white/15 px-3 py-1 font-mono text-xs font-extrabold text-fuchsia-200">
                {codigoPatrimonial.trim() ? codigoPatrimonial.trim().toUpperCase() : 'INV-XXX-000'}
              </span>
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300">
                Disponible
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-purple-200 ring-1 ring-white/20">
                <Cpu className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-purple-200/75">
                  Vista previa de tarjeta
                </p>
                <p className="truncate text-base font-black text-white">
                  {nombre.trim() || 'Nombre del equipo tecnológico'}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-2xl bg-white/8 p-3.5 text-xs text-purple-100 ring-1 ring-white/10">
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-fuchsia-300" />
                <span>{CATEGORIA_LABELS[categoria] ?? categoria}</span>
                <span>•</span>
                <span className="font-bold text-white">{marca.trim() || 'Marca'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-fuchsia-300" />
                <span>{ubicacion.trim() || 'Ubicación asignada'}</span>
              </div>
            </div>
          </div>

          <Card className="rounded-3xl border-purple-200/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Validaciones Patrimoniales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  El código patrimonial es único y no puede repetirse con otro activo.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  Se registrará automáticamente un movimiento de tipo <strong>Registro</strong> en el historial.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
