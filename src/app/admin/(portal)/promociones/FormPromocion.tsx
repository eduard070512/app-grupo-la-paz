"use client";
import { useActionState } from "react";
import { Alerta, BotonEnviar } from "@/components/Formulario";
import { guardarPromocion } from "../../acciones";

const IMAGENES = [
  ["", "Sin imagen"],
  ["/galeria/descuento-15.jpg", "15% de descuento"],
  ["/galeria/cobertura-familiar-beneficios.jpg", "Cobertura familiar"],
  ["/galeria/compromiso.jpg", "Compromiso con tu paz"],
  ["/galeria/salas-velacion.jpg", "Salas de velación"],
  ["/galeria/beneficios-prevision.jpg", "Beneficios previsión"],
  ["/galeria/dos-seguros.jpg", "Dos seguros"],
  ["/planes/lp-zoo-descanso-mini.jpg", "Zoo Descanso"],
  ["/planes/lp-devuelvelo-a-casa-mini.jpg", "Devuélvelo a Casa"],
];

export function FormPromocion() {
  const [e, a] = useActionState(guardarPromocion, undefined);
  return (
    <form action={a} className="mt-3 space-y-3">
      {(e?.error || e?.ok) && <Alerta tipo={e.error ? "error" : "exito"}>{e.error ?? e.ok}</Alerta>}
      <div><label className="etiqueta">Título</label><input name="titulo" className="campo" required /></div>
      <div><label className="etiqueta">Descripción</label><textarea name="descripcion" rows={3} className="campo" required /></div>
      <div>
        <label className="etiqueta">Audiencia</label>
        <select name="audiencia" className="campo">
          <option value="TODOS">Todos</option>
          <option value="CLIENTES">Solo clientes</option>
          <option value="EMPRESAS">Solo empresas afiliadas</option>
        </select>
      </div>
      <div>
        <label className="etiqueta">Imagen</label>
        <select name="imagenUrl" className="campo">{IMAGENES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
        <p className="mt-1 text-xs text-gris">En producción se puede habilitar subir imágenes propias (almacenamiento en la nube).</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="etiqueta">Vigente hasta</label><input name="vigenteHasta" type="date" className="campo" /></div>
        <div><label className="etiqueta">Orden</label><input name="orden" type="number" defaultValue={0} className="campo" /></div>
      </div>
      <BotonEnviar>Publicar</BotonEnviar>
    </form>
  );
}
