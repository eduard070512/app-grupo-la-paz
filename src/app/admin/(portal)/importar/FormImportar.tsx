"use client";
import { useActionState } from "react";
import { Alerta, BotonEnviar } from "@/components/Formulario";
import { importarArchivo } from "../../acciones";

export function FormImportar({ tipo }: { tipo: string }) {
  const [e, a] = useActionState(importarArchivo, undefined);
  const r = e?.reporte;
  return (
    <form action={a} className="mt-4 space-y-3">
      <input type="hidden" name="tipo" value={tipo} />
      <input name="archivo" type="file" accept=".csv,text/csv" className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-paz-100 file:px-3 file:py-2 file:font-semibold file:text-paz-800" required />
      <BotonEnviar pendiente="Importando…">Importar</BotonEnviar>
      {e?.error && <Alerta>{e.error}</Alerta>}
      {r && (
        <Alerta tipo={r.errores.length ? "error" : "exito"}>
          <p>{r.filas} filas · {r.creados} creados · {r.actualizados} actualizados · {r.omitidos} omitidos · {r.errores.length} errores</p>
          {r.avisos.map((x) => <p key={x} className="mt-1 text-xs">{x}</p>)}
          {r.errores.length > 0 && (
            <ul className="mt-2 max-h-48 overflow-auto text-xs">
              {r.errores.slice(0, 100).map((x) => <li key={x.fila + x.mensaje}>Fila {x.fila}: {x.mensaje}</li>)}
            </ul>
          )}
        </Alerta>
      )}
    </form>
  );
}
