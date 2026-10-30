"use client";
import { useActionState } from "react";
import { Alerta, BotonEnviar } from "@/components/Formulario";
import { actualizarCliente, registrarPago } from "../../../acciones";

export function FormCliente({ cliente }: { cliente: { id: string; nombre: string; telefono: string; email: string } }) {
  const [e, a] = useActionState(actualizarCliente, undefined);
  return (
    <form action={a} className="mt-4 grid gap-3 sm:grid-cols-3">
      {(e?.error || e?.ok) && <div className="sm:col-span-3"><Alerta tipo={e.error ? "error" : "exito"}>{e.error ?? e.ok}</Alerta></div>}
      <input type="hidden" name="id" value={cliente.id} />
      <div><label className="etiqueta">Nombre</label><input name="nombre" defaultValue={cliente.nombre} className="campo" required /></div>
      <div><label className="etiqueta">Teléfono</label><input name="telefono" defaultValue={cliente.telefono} className="campo" required /></div>
      <div><label className="etiqueta">Correo</label><input name="email" type="email" defaultValue={cliente.email} className="campo" /></div>
      <div className="sm:col-span-3"><BotonEnviar className="btn-secundario">Guardar datos</BotonEnviar></div>
    </form>
  );
}

export function FormPago({ contratoId, abono }: { contratoId: string; abono: number }) {
  const [e, a] = useActionState(registrarPago, undefined);
  return (
    <form action={a} className="space-y-2">
      {(e?.error || e?.ok) && <Alerta tipo={e.error ? "error" : "exito"}>{e.error ?? e.ok}</Alerta>}
      <input type="hidden" name="contratoId" value={contratoId} />
      <div className="grid grid-cols-2 gap-2">
        <input name="fecha" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="campo py-2" required />
        <input name="monto" defaultValue={abono ? abono / 100 : ""} className="campo py-2" placeholder="Monto $" required />
        <select name="metodo" className="campo py-2">
          <option value="EFECTIVO">Efectivo</option>
          <option value="TRANSFERENCIA">Transferencia</option>
          <option value="TARJETA">Tarjeta</option>
          <option value="DEPOSITO">Depósito</option>
        </select>
        <input name="folio" className="campo py-2" placeholder="Folio" />
      </div>
      <BotonEnviar className="btn-primario w-full py-2.5">Registrar pago</BotonEnviar>
    </form>
  );
}
