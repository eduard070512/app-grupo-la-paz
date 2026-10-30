import Link from "next/link";
import type { Metadata } from "next";
import { PantallaAcceso } from "@/components/PantallaAcceso";
import { FlujoActivacion } from "./FlujoActivacion";

export const metadata: Metadata = { title: "Activar mi cuenta", manifest: "/manifest-clientes.webmanifest" };

export default function Page() {
  return (
    <PantallaAcceso
      subtitulo="MI PLAN"
      titulo="Activa tu cuenta"
      texto="Solo la primera vez. Verificaremos tu identidad con un código que enviaremos a tu teléfono registrado."
      pie={<Link href="/clientes/entrar" className="font-semibold text-oro-300 hover:underline">Ya tengo cuenta · Iniciar sesión</Link>}
    >
      <FlujoActivacion />
    </PantallaAcceso>
  );
}
