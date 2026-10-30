"use client";
import { useActionState } from "react";
import { Alerta, BotonEnviar, Formulario } from "@/components/Formulario";
import { restablecer } from "../../acciones";

export function FormRestablecer({ token }: { token: string }) {
  const [estado, accion, accionPend] = useActionState(restablecer, undefined);
  return (
    <Formulario accion={accion} pendiente={accionPend} className="space-y-4">
      {estado?.error && <Alerta>{estado.error}</Alerta>}
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="etiqueta" htmlFor="contrasena">Nueva contraseña</label>
        <input id="contrasena" name="contrasena" type="password" className="campo" autoComplete="new-password" minLength={8} required />
        <p className="mt-1 text-xs text-gris">Mínimo 8 caracteres, con letras y números.</p>
      </div>
      <div>
        <label className="etiqueta" htmlFor="confirmar">Confirmar</label>
        <input id="confirmar" name="confirmar" type="password" className="campo" autoComplete="new-password" required />
      </div>
      <BotonEnviar pendiente="Guardando…">Guardar y entrar</BotonEnviar>
    </Formulario>
  );
}
