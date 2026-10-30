"use client";
import Link from "next/link";
import { useActionState } from "react";
import { Alerta, BotonEnviar, Formulario } from "@/components/Formulario";
import { solicitarRecuperacion } from "../../acciones";

export function FormRecuperar() {
  const [estado, accion, accionPend] = useActionState(solicitarRecuperacion, undefined);
  return (
    <Formulario accion={accion} pendiente={accionPend} className="space-y-4">
      {estado?.error && <Alerta>{estado.error}</Alerta>}
      {estado?.ok && <Alerta tipo="exito">{estado.ok}</Alerta>}
      {estado?.demo && (
        <Alerta tipo="demo">
          Modo demo (sin n8n configurado). El enlace que llegaría es:{" "}
          <Link href={estado.demo.replace(/^https?:\/\/[^/]+/, "")} className="break-all font-semibold underline">abrir enlace</Link>
        </Alerta>
      )}
      <div>
        <label className="etiqueta" htmlFor="identificador">Número de contrato o correo</label>
        <input id="identificador" name="identificador" className="campo" required />
      </div>
      <BotonEnviar pendiente="Enviando…">Enviar enlace</BotonEnviar>
    </Formulario>
  );
}
