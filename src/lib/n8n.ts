import "server-only";
import { createHmac } from "node:crypto";

/**
 * Eventos que la app envía a n8n. En n8n se crea un workflow con un nodo Webhook (POST)
 * y un Switch por `evento` que decide el canal (correo, WhatsApp, SMS, CRM…).
 */
export type EventoN8n =
  | { evento: "cliente.codigo_activacion"; datos: { nombre: string; telefono: string; contrato: string; codigo: string; minutosVigencia: number } }
  | { evento: "cliente.recuperar_contrasena"; datos: { nombre: string; canal: "email" | "whatsapp"; email: string | null; telefono: string; link: string; minutosVigencia: number } }
  | { evento: "cliente.cuenta_activada"; datos: { nombre: string; telefono: string; email: string | null; contrato: string } }
  | { evento: "solicitud.creada"; datos: { origen: string; empresa: string | null; nombre: string; telefono: string | null; motivo: string; modalidad: string | null; preferencia: string | null; mensaje: string } };

export const modoDemo = () => !process.env.N8N_WEBHOOK_URL;

export async function enviarEventoN8n(e: EventoN8n): Promise<{ enviado: boolean }> {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) {
    console.info(`[n8n · modo demo] ${e.evento}`, JSON.stringify(e.datos));
    return { enviado: false };
  }
  const cuerpo = JSON.stringify({ ...e, fecha: new Date().toISOString(), app: "grupo-la-paz" });
  const firma = createHmac("sha256", process.env.N8N_WEBHOOK_SECRET ?? "").update(cuerpo).digest("hex");
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-lapaz-signature": firma },
      body: cuerpo,
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) console.error(`[n8n] ${e.evento} respondió ${r.status}`);
    return { enviado: r.ok };
  } catch (err) {
    console.error(`[n8n] error enviando ${e.evento}`, err);
    return { enviado: false };
  }
}
