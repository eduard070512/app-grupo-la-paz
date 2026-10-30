"use client";
import { useActionState, useState } from "react";
import { Alerta, BotonEnviar, Formulario } from "@/components/Formulario";
import type { Frec, Plazos, Variante } from "@/lib/formato";
import { crearContrato } from "../../../acciones";

type P = { id: string; nombre: string; variantes: Variante[]; plazos: Plazos };

export function FormNuevoContrato({ funerarias, planes }: { funerarias: { id: string; nombre: string }[]; planes: P[] }) {
  const [e, a, aPend] = useActionState(crearContrato, undefined);
  const [planId, setPlanId] = useState(planes[0]?.id ?? "");
  const [vi, setVi] = useState(0);
  const [frec, setFrec] = useState<Frec | "CONTADO">("MENSUAL");
  const plan = planes.find((p) => p.id === planId);
  const v = plan?.variantes[vi];
  const pesos = (c?: number) => (c ? String(c / 100) : "");
  const hoy = new Date().toISOString().slice(0, 10);
  // la clave fuerza a recalcular los valores por defecto al cambiar plan/variante/frecuencia
  const k = `${planId}-${vi}-${frec}`;

  return (
    <Formulario accion={a} pendiente={aPend} className="grid gap-4 sm:grid-cols-2">
      {e?.error && <div className="sm:col-span-2"><Alerta>{e.error}</Alerta></div>}
      <div><label className="etiqueta">Número de contrato</label><input name="numero" className="campo uppercase" required /></div>
      <div>
        <label className="etiqueta">Casa funeraria</label>
        <select name="funerariaId" className="campo">{funerarias.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}</select>
      </div>
      <div className="sm:col-span-2"><label className="etiqueta">Nombre del titular</label><input name="nombre" className="campo" required /></div>
      <div><label className="etiqueta">Teléfono (10 dígitos)</label><input name="telefono" className="campo" inputMode="tel" required /></div>
      <div><label className="etiqueta">Correo (opcional)</label><input name="email" type="email" className="campo" /></div>

      <div className="sm:col-span-2">
        <label className="etiqueta">Plan</label>
        <select name="planId" className="campo" value={planId} onChange={(x) => { setPlanId(x.target.value); setVi(0); }}>
          {planes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>
      {plan && plan.variantes.length > 1 && (
        <div className="sm:col-span-2">
          <label className="etiqueta">Variante</label>
          <select className="campo" value={vi} onChange={(x) => setVi(Number(x.target.value))}>
            {plan.variantes.map((x, i) => <option key={x.nombre} value={i}>{x.nombre}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="etiqueta">Forma de pago</label>
        <select name="frecuencia" className="campo" value={frec} onChange={(x) => setFrec(x.target.value as Frec)}>
          <option value="SEMANAL">Semanal</option>
          <option value="QUINCENAL">Quincenal</option>
          <option value="MENSUAL">Mensual</option>
          <option value="CONTADO">Contado</option>
        </select>
      </div>
      <div><label className="etiqueta">Fecha de contratación</label><input name="fecha" type="date" defaultValue={hoy} className="campo" required /></div>
      <div key={`t${k}`}><label className="etiqueta">Monto total ($)</label><input name="total" className="campo" defaultValue={pesos(v?.precioCentavos)} required /></div>
      <div key={`i${k}`}><label className="etiqueta">Pago inicial ($)</label><input name="inicial" className="campo" defaultValue={pesos(v?.inicialCentavos)} /></div>
      <div key={`a${k}`}><label className="etiqueta">Abono ($)</label><input name="abono" className="campo" defaultValue={frec === "CONTADO" ? "" : pesos(v?.abonos[frec])} /></div>
      <div key={`n${k}`}><label className="etiqueta">Número de abonos</label><input name="numeroAbonos" className="campo" defaultValue={frec === "CONTADO" ? "" : String(plan?.plazos[frec] ?? "")} /></div>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="inicialPagado" defaultChecked className="h-4 w-4 accent-paz-700" /> Registrar el pago inicial como pagado
      </label>
      <div className="sm:col-span-2"><BotonEnviar>Crear contrato</BotonEnviar></div>
    </Formulario>
  );
}
