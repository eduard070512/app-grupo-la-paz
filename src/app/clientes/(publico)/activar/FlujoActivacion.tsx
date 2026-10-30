"use client";
import { useActionState, useEffect, useState } from "react";
import { Alerta, BotonEnviar, Formulario } from "@/components/Formulario";
import { completarActivacion, iniciarActivacion, verificarCodigoActivacion, type Estado } from "../../acciones";

const PASOS = ["Tus datos", "Código", "Contraseña"];

export function FlujoActivacion() {
  const [e1, a1, a1Pend] = useActionState(iniciarActivacion, undefined);
  const [e2, a2, a2Pend] = useActionState(verificarCodigoActivacion, undefined);
  const [e3, a3, a3Pend] = useActionState(completarActivacion, undefined);
  const [paso, setPaso] = useState<NonNullable<Estado>["paso"]>("datos");
  const [info, setInfo] = useState<Estado>(undefined);

  useEffect(() => {
    if (e1?.paso) setPaso(e1.paso);
    if (e1?.paso === "codigo") setInfo(e1);
  }, [e1]);
  useEffect(() => void (e2?.paso && setPaso(e2.paso)), [e2]);
  useEffect(() => void (e3?.paso && setPaso(e3.paso)), [e3]);

  const indice = paso === "datos" ? 0 : paso === "codigo" ? 1 : 2;

  return (
    <div>
      <ol className="mb-6 grid grid-cols-3 gap-2">
        {PASOS.map((p, i) => (
          <li key={p} className="text-center">
            <span className={`mx-auto block h-1.5 rounded-full ${i <= indice ? "bg-paz-700" : "bg-paz-100"}`} />
            <span className={`mt-1.5 block text-[11px] font-medium ${i === indice ? "text-paz-800" : "text-gris"}`}>{p}</span>
          </li>
        ))}
      </ol>

      {paso === "datos" && (
        <Formulario accion={a1} pendiente={a1Pend} className="space-y-4">
          {(e1?.error || e2?.error || e3?.error) && <Alerta>{e1?.error ?? e2?.error ?? e3?.error}</Alerta>}
          <div>
            <label className="etiqueta" htmlFor="contrato">Número de contrato</label>
            <input id="contrato" name="contrato" className="campo uppercase" placeholder="Ej. LP-10002" autoCapitalize="characters" required />
            <p className="mt-1 text-xs text-gris">Viene en tu contrato o en tus recibos de pago.</p>
          </div>
          <div>
            <label className="etiqueta" htmlFor="telefono">Teléfono registrado</label>
            <input id="telefono" name="telefono" className="campo" inputMode="tel" placeholder="10 dígitos" autoComplete="tel-national" required />
          </div>
          <BotonEnviar pendiente="Verificando…">Enviarme un código</BotonEnviar>
        </Formulario>
      )}

      {paso === "codigo" && (
        <Formulario accion={a2} pendiente={a2Pend} className="space-y-4">
          {info?.demo && <Alerta tipo="demo">{info.demo}</Alerta>}
          {e2?.error && <Alerta>{e2.error}</Alerta>}
          <p className="text-sm text-gris">
            Enviamos un código de 6 dígitos por WhatsApp al teléfono <strong className="text-paz-900">{info?.telefono}</strong>. Vence en 10 minutos.
          </p>
          <div>
            <label className="etiqueta" htmlFor="codigo">Código de verificación</label>
            <input id="codigo" name="codigo" className="campo text-center text-2xl tracking-[.5em]" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="\d{6}" required />
          </div>
          <BotonEnviar pendiente="Verificando…">Verificar código</BotonEnviar>
          <button type="button" onClick={() => setPaso("datos")} className="w-full text-sm font-medium text-paz-600 hover:underline">
            No me llegó · volver a intentar
          </button>
        </Formulario>
      )}

      {paso === "contrasena" && (
        <Formulario accion={a3} pendiente={a3Pend} className="space-y-4">
          {e3?.error && <Alerta>{e3.error}</Alerta>}
          <Alerta tipo="exito">¡Identidad verificada! Ahora crea tu contraseña.</Alerta>
          <div>
            <label className="etiqueta" htmlFor="email">Correo electrónico <span className="font-normal text-gris">(recomendado)</span></label>
            <input id="email" name="email" type="email" className="campo" autoComplete="email" placeholder="tucorreo@ejemplo.com" />
            <p className="mt-1 text-xs text-gris">Lo usaremos solo para recuperar tu contraseña y enviarte tus comprobantes. Si no tienes, te ayudamos por WhatsApp.</p>
          </div>
          <div>
            <label className="etiqueta" htmlFor="contrasena">Crea una contraseña</label>
            <input id="contrasena" name="contrasena" type="password" className="campo" autoComplete="new-password" minLength={8} required />
            <p className="mt-1 text-xs text-gris">Mínimo 8 caracteres, con letras y números.</p>
          </div>
          <div>
            <label className="etiqueta" htmlFor="confirmar">Confirma tu contraseña</label>
            <input id="confirmar" name="confirmar" type="password" className="campo" autoComplete="new-password" required />
          </div>
          <BotonEnviar pendiente="Guardando…">Activar mi cuenta</BotonEnviar>
        </Formulario>
      )}
    </div>
  );
}
