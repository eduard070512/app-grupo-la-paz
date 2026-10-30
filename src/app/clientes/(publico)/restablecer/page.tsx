import Link from "next/link";
import type { Metadata } from "next";
import { PantallaAcceso } from "@/components/PantallaAcceso";
import { Alerta } from "@/components/Formulario";
import { buscarTokenRecuperacion } from "@/lib/seguridad";
import { FormRestablecer } from "./FormRestablecer";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const valido = token ? await buscarTokenRecuperacion(token) : null;
  return (
    <PantallaAcceso subtitulo="MI PLAN" titulo="Nueva contraseña">
      {valido ? (
        <FormRestablecer token={token} />
      ) : (
        <div className="space-y-4">
          <Alerta>El enlace expiró o ya fue utilizado.</Alerta>
          <Link href="/clientes/recuperar" className="btn-primario w-full">Solicitar uno nuevo</Link>
        </div>
      )}
    </PantallaAcceso>
  );
}
