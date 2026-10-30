"use client";
import { useActionState } from "react";
import { Alerta, BotonEnviar, Formulario } from "@/components/Formulario";
import { entrar } from "../../acciones";

export function FormEntrar() {
  const [e, a, aPend] = useActionState(entrar, undefined);
  return (
    <Formulario accion={a} pendiente={aPend} className="space-y-4">
      {e?.error && <Alerta>{e.error}</Alerta>}
      <div>
        <label className="etiqueta" htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" className="campo" autoComplete="username" required />
      </div>
      <div>
        <label className="etiqueta" htmlFor="contrasena">Contraseña</label>
        <input id="contrasena" name="contrasena" type="password" className="campo" autoComplete="current-password" required />
      </div>
      <BotonEnviar pendiente="Entrando…">Entrar</BotonEnviar>
    </Formulario>
  );
}
