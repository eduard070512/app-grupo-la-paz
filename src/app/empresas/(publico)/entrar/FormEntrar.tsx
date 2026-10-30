"use client";
import { useActionState } from "react";
import { Alerta, BotonEnviar, Formulario } from "@/components/Formulario";
import { entrar } from "../../acciones";

export function FormEntrar() {
  const [estado, accion, accionPend] = useActionState(entrar, undefined);
  return (
    <Formulario accion={accion} pendiente={accionPend} className="space-y-4">
      {estado?.error && <Alerta>{estado.error}</Alerta>}
      <div>
        <label className="etiqueta" htmlFor="usuario">Usuario de la empresa</label>
        <input id="usuario" name="usuario" className="campo" autoComplete="username" autoCapitalize="none" required />
      </div>
      <div>
        <label className="etiqueta" htmlFor="contrasena">Contraseña</label>
        <input id="contrasena" name="contrasena" type="password" className="campo" autoComplete="current-password" required />
      </div>
      <BotonEnviar pendiente="Entrando…">Entrar</BotonEnviar>
    </Formulario>
  );
}
