"use client";
import { useActionState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { BotonEnviar } from "./Formulario";
import type { Estado } from "@/app/clientes/acciones";

/** Registra la solicitud en el servidor y abre WhatsApp con el mensaje ya redactado */
export function BotonAsesor({
  accion,
  campos,
  children = "Hablar con un asesor",
  className = "btn-whatsapp w-full",
}: {
  accion: (e: Estado, f: FormData) => Promise<Estado>;
  campos: Record<string, string>;
  children?: React.ReactNode;
  className?: string;
}) {
  const [estado, enviar] = useActionState(accion, undefined);
  useEffect(() => {
    if (estado?.url) window.location.href = estado.url;
  }, [estado]);
  return (
    <form action={enviar}>
      {Object.entries(campos).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <BotonEnviar className={className} pendiente="Abriendo WhatsApp…">
        <MessageCircle className="h-4 w-4" /> {children}
      </BotonEnviar>
      {estado?.error && <p className="mt-2 text-sm text-red-700">{estado.error}</p>}
    </form>
  );
}
