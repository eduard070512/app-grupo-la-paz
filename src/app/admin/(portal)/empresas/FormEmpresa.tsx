"use client";
import { useActionState } from "react";
import type { Empresa } from "@prisma/client";
import { Alerta, BotonEnviar, Formulario } from "@/components/Formulario";
import { guardarEmpresa } from "../../acciones";

export function FormEmpresa({ empresa }: { empresa?: Empresa }) {
  const [e, a, aPend] = useActionState(guardarEmpresa, undefined);
  const campo = (name: keyof Empresa, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="etiqueta">{label}</label>
      <input name={name} defaultValue={(empresa?.[name] as string | number | null) ?? ""} className="campo" {...extra} />
    </div>
  );
  return (
    <Formulario accion={a} pendiente={aPend} className="grid gap-4 sm:grid-cols-2">
      {e?.error && <div className="sm:col-span-2"><Alerta>{e.error}</Alerta></div>}
      <input type="hidden" name="id" value={empresa?.id ?? ""} />
      {campo("nombre", "Nombre de la empresa", { required: true })}
      {campo("giro", "Giro")}
      <div>
        <label className="etiqueta">Usuario de acceso</label>
        <input name="usuario" defaultValue={empresa?.usuario ?? ""} className="campo font-mono" required autoCapitalize="none" />
      </div>
      <div>
        <label className="etiqueta">{empresa ? "Nueva contraseña (vacío = no cambiar)" : "Contraseña"}</label>
        <input name="contrasena" className="campo font-mono" required={!empresa} autoComplete="new-password" />
      </div>
      <div>
        <label className="etiqueta">Descuento a empleados (%)</label>
        <input name="descuento" type="number" min={0} max={100} defaultValue={empresa?.descuentoEmpleados ?? 15} className="campo" />
      </div>
      {campo("telefono", "Teléfono")}
      {campo("direccion", "Dirección")}
      {campo("sitioWeb", "Sitio web", { type: "url", placeholder: "https://" })}
      {campo("logoUrl", "URL del logo (opcional)")}
      <div className="sm:col-span-2">
        <label className="etiqueta">Descripción (se muestra en el directorio de aliados)</label>
        <textarea name="descripcion" defaultValue={empresa?.descripcion ?? ""} className="campo" rows={2} />
      </div>
      <div className="sm:col-span-2">
        <label className="etiqueta">Oferta para clientes de La Paz (publicidad cruzada)</label>
        <input name="ofertaClientes" defaultValue={empresa?.ofertaClientes ?? ""} className="campo" placeholder="Ej. 10% en alineación y balanceo" />
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="visibleDirectorio" defaultChecked={empresa?.visibleDirectorio ?? true} className="h-4 w-4 accent-paz-700" /> Mostrar en directorio de aliados</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="activa" defaultChecked={empresa?.activa ?? true} className="h-4 w-4 accent-paz-700" /> Empresa activa (puede iniciar sesión)</label>
      <div className="sm:col-span-2"><BotonEnviar>Guardar empresa</BotonEnviar></div>
    </Formulario>
  );
}
