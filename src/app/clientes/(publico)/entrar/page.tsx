import Link from "next/link";
import type { Metadata } from "next";
import { PantallaAcceso } from "@/components/PantallaAcceso";
import { FormEntrar } from "./FormEntrar";

export const metadata: Metadata = { title: "Clientes · Iniciar sesión", manifest: "/manifest-clientes.webmanifest" };

export default function Page() {
  return (
    <PantallaAcceso
      subtitulo="MI PLAN"
      titulo="Bienvenido"
      texto="Consulta tu plan, tus pagos y tus beneficios como cliente de Grupo La Paz."
      pie={
        <>
          ¿Eres empleado de una empresa afiliada?{" "}
          <Link href="/empresas/entrar" className="font-semibold text-oro-300 hover:underline">Entra aquí</Link>
        </>
      }
    >
      <FormEntrar />
      <div className="mt-6 rounded-xl bg-paz-50 p-4 text-sm">
        <p className="font-semibold text-paz-900">¿Es tu primera vez?</p>
        <p className="mt-0.5 text-gris">Activa tu cuenta con tu número de contrato y el teléfono que registraste.</p>
        <Link href="/clientes/activar" className="btn-oro mt-3 w-full">Activar mi cuenta</Link>
      </div>
    </PantallaAcceso>
  );
}
