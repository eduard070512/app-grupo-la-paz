"use client";
import Link from "next/link";
import { useActionState } from "react";
import { Alerta, BotonEnviar, Formulario } from "@/components/Formulario";
import { entrar } from "../../acciones";

export function FormEntrar() {
  const [estado, accion, accionPend] = useActionState(entrar, undefined);
  return (
    <Formulario accion={accion} pendiente={accionPend} className="space-y-4">
      {estado?.error && <Alerta>{estado.error}</Alerta>}
      <div>
        <label className="etiqueta" htmlFor="identificador">Número de contrato o correo</label>
        <input id="identificador" name="identificador" className="campo" placeholder="Ej. LP-10001" autoComplete="username" autoCapitalize="characters" required />
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <label className="etiqueta" htmlFor="contrasena">Contraseña</label>
          <Link href="/clientes/recuperar" className="text-xs font-medium text-paz-600 hover:underline">¿La olvidaste?</Link>
        </div>
        <input id="contrasena" name="contrasena" type="password" className="campo" autoComplete="current-password" required />
      </div>
      <BotonEnviar pendiente="Entrando…">Entrar</BotonEnviar>
    </Formulario>
  );
}
