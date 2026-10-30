import Link from "next/link";
import type { Metadata } from "next";
import { PantallaAcceso } from "@/components/PantallaAcceso";
import { FormRecuperar } from "./FormRecuperar";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function Page() {
  return (
    <PantallaAcceso
      subtitulo="MI PLAN"
      titulo="Recuperar contraseña"
      texto="Te enviaremos un enlace seguro a tu correo (o a tu WhatsApp si no registraste correo)."
      pie={<Link href="/clientes/entrar" className="font-semibold text-oro-300 hover:underline">Volver a iniciar sesión</Link>}
    >
      <FormRecuperar />
    </PantallaAcceso>
  );
}
