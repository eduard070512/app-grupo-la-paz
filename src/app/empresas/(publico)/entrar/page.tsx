import Link from "next/link";
import type { Metadata } from "next";
import { PantallaAcceso } from "@/components/PantallaAcceso";
import { FormEntrar } from "./FormEntrar";

export const metadata: Metadata = { title: "Empresas afiliadas · Acceso", manifest: "/manifest-empresas.webmanifest" };

export default function Page() {
  return (
    <PantallaAcceso
      subtitulo="EMPRESAS AFILIADAS"
      titulo="Beneficios para colaboradores"
      texto="Entra con el usuario y la contraseña que te compartió tu empresa para conocer tus beneficios y descuentos en Grupo La Paz."
      pie={
        <>
          ¿Eres cliente de La Paz?{" "}
          <Link href="/clientes/entrar" className="font-semibold text-oro-300 hover:underline">Consulta tu plan aquí</Link>
        </>
      }
    >
      <FormEntrar />
    </PantallaAcceso>
  );
}
