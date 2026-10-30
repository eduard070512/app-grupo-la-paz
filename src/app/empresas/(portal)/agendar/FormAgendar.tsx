"use client";
import { useActionState, useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Alerta, BotonEnviar, Formulario } from "@/components/Formulario";
import { agendarCita } from "../../acciones";

const MODALIDADES = [
  { v: "PRESENCIAL", t: "Cita presencial" },
  { v: "LLAMADA", t: "Llamada" },
  { v: "VIDEOLLAMADA", t: "Videollamada" },
];

export function FormAgendar({ empresa, motivos, motivoInicial }: { empresa: string; motivos: string[]; motivoInicial: string }) {
  const [estado, accion, accionPend] = useActionState(agendarCita, undefined);
  const [nombre, setNombre] = useState("");
  const [motivo, setMotivo] = useState(motivoInicial);
  const [modalidad, setModalidad] = useState("PRESENCIAL");
  const [preferencia, setPreferencia] = useState("");

  useEffect(() => {
    if (estado?.url) window.location.href = estado.url;
  }, [estado]);

  const vista = [
    `Hola, ${nombre ? `soy *${nombre}*, ` : "soy "}colaborador(a) de *${empresa}*, empresa afiliada a Grupo La Paz.`,
    `Me gustaría agendar ${MODALIDADES.find((m) => m.v === modalidad)?.t.toLowerCase()} con ustedes para: ${motivo}.`,
    preferencia && `Horario de preferencia: ${preferencia}.`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <Formulario accion={accion} pendiente={accionPend} className="space-y-4">
      {estado?.error && <Alerta>{estado.error}</Alerta>}
      <div>
        <label className="etiqueta" htmlFor="nombre">Tu nombre</label>
        <input id="nombre" name="nombre" className="campo" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" required />
      </div>
      <div>
        <label className="etiqueta" htmlFor="telefono">Tu teléfono <span className="font-normal text-gris">(opcional)</span></label>
        <input id="telefono" name="telefono" className="campo" inputMode="tel" autoComplete="tel-national" placeholder="10 dígitos" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="motivo">¿Sobre qué quieres hablar?</label>
        <select id="motivo" name="motivo" className="campo" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
          {motivos.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>
      <fieldset>
        <legend className="etiqueta">Modalidad</legend>
        <div className="grid grid-cols-3 gap-2">
          {MODALIDADES.map((m) => (
            <label key={m.v} className={`cursor-pointer rounded-xl px-1 py-3 text-center text-[13px] font-medium ring-1 transition ${modalidad === m.v ? "bg-paz-800 text-white ring-paz-800" : "bg-white text-paz-800 ring-paz-200"}`}>
              <input type="radio" name="modalidad" value={m.v} checked={modalidad === m.v} onChange={() => setModalidad(m.v)} className="sr-only" />
              {m.t}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="etiqueta" htmlFor="preferencia">Día y horario de preferencia</label>
        <input id="preferencia" name="preferencia" className="campo" value={preferencia} onChange={(e) => setPreferencia(e.target.value)} placeholder="Ej. martes por la tarde" />
      </div>
      <div className="rounded-xl bg-[#e7f6ec] p-3 text-sm text-[#14532d]">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider">Vista previa del mensaje</p>
        <p className="whitespace-pre-line">{vista}</p>
      </div>
      <BotonEnviar className="btn-whatsapp w-full" pendiente="Abriendo WhatsApp…">
        <MessageCircle className="h-4 w-4" /> Enviar por WhatsApp
      </BotonEnviar>
    </Formulario>
  );
}
