"use client";
import { useActionState } from "react";
import { Alerta, BotonEnviar, Formulario } from "@/components/Formulario";
import { actualizarCorreo, cambiarContrasena } from "../../acciones";

export function FormCorreo({ email }: { email: string }) {
  const [e, a, aPend] = useActionState(actualizarCorreo, undefined);
  return (
    <Formulario accion={a} pendiente={aPend} className="mt-2 space-y-3">
      {e?.error && <Alerta>{e.error}</Alerta>}
      {e?.ok && <Alerta tipo="exito">{e.ok}</Alerta>}
      <input name="email" type="email" defaultValue={email} className="campo" placeholder="tucorreo@ejemplo.com" />
      <BotonEnviar className="btn-secundario">Guardar correo</BotonEnviar>
    </Formulario>
  );
}

export function FormContrasena() {
  const [e, a, aPend] = useActionState(cambiarContrasena, undefined);
  return (
    <Formulario accion={a} pendiente={aPend} className="mt-3 space-y-3">
      {e?.error && <Alerta>{e.error}</Alerta>}
      {e?.ok && <Alerta tipo="exito">{e.ok}</Alerta>}
      <div>
        <label className="etiqueta">Contraseña actual</label>
        <input name="actual" type="password" className="campo" autoComplete="current-password" required />
      </div>
      <div>
        <label className="etiqueta">Nueva contraseña</label>
        <input name="nueva" type="password" className="campo" autoComplete="new-password" minLength={8} required />
      </div>
      <div>
        <label className="etiqueta">Confirmar</label>
        <input name="confirmar" type="password" className="campo" autoComplete="new-password" required />
      </div>
      <BotonEnviar>Actualizar contraseña</BotonEnviar>
    </Formulario>
  );
}
