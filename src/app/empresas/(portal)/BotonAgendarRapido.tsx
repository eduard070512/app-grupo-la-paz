"use client";
import { useActionState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { BotonEnviar } from "@/components/Formulario";
import { agendarCita } from "../acciones";

/** Envía el mensaje predefinido por WhatsApp en un toque */
export function BotonAgendarRapido({ motivo, texto = "Agendar cita por WhatsApp", className = "btn-whatsapp w-full" }: { motivo?: string; texto?: string; className?: string }) {
  const [estado, accion] = useActionState(agendarCita, undefined);
  useEffect(() => {
    if (estado?.url) window.location.href = estado.url;
  }, [estado]);
  return (
    <form action={accion}>
      {motivo && <input type="hidden" name="motivo" value={motivo} />}
      <BotonEnviar className={className} pendiente="Abriendo WhatsApp…">
        <MessageCircle className="h-4 w-4" /> {texto}
      </BotonEnviar>
      {estado?.error && <p className="mt-2 text-sm text-red-200">{estado.error}</p>}
    </form>
  );
}
