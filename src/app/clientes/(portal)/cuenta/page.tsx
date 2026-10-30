import { db } from "@/lib/db";
import { requerirSesion } from "@/lib/sesion";
import { Encabezado } from "@/components/Piezas";
import { fecha, telefonoLegible } from "@/lib/formato";
import { CONTACTO } from "@/lib/contenido";
import { FormCorreo, FormContrasena } from "./Formularios";

export const metadata = { title: "Mi cuenta" };

export default async function Page() {
  const s = await requerirSesion("cliente");
  const c = await db.cliente.findUniqueOrThrow({ where: { id: s.sub }, include: { funeraria: true } });
  return (
    <>
      <Encabezado titulo="Mi cuenta" />
      <div className="grid gap-4 md:grid-cols-2">
        <section className="tarjeta p-5">
          <h2 className="titulo text-2xl">Mis datos</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-gris">Nombre</dt><dd className="font-medium">{c.nombre}</dd></div>
            <div><dt className="text-gris">Teléfono</dt><dd className="font-medium">{telefonoLegible(c.telefono)}</dd></div>
            <div><dt className="text-gris">Casa funeraria</dt><dd className="font-medium">{c.funeraria.nombre}</dd></div>
            {c.activadoEn && <div><dt className="text-gris">Cuenta activa desde</dt><dd className="font-medium">{fecha(c.activadoEn)}</dd></div>}
          </dl>
          <p className="mt-4 text-xs text-gris">¿Algún dato es incorrecto? Comunícate a la {CONTACTO.oficinaPrevision.nombre.toLowerCase()}: {telefonoLegible(CONTACTO.oficinaPrevision.telefono)} · {CONTACTO.horarioOficina}.</p>
          <h3 className="mt-6 font-semibold text-paz-900">Correo para recuperar tu cuenta</h3>
          <FormCorreo email={c.email ?? ""} />
        </section>
        <section className="tarjeta p-5">
          <h2 className="titulo text-2xl">Cambiar contraseña</h2>
          <FormContrasena />
        </section>
      </div>
    </>
  );
}
