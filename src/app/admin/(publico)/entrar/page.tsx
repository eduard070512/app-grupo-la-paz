import { PantallaAcceso } from "@/components/PantallaAcceso";
import { FormEntrar } from "./FormEntrar";

export const metadata = { title: "Administración" };

export default function Page() {
  return (
    <PantallaAcceso subtitulo="ADMINISTRACIÓN" titulo="Panel interno" texto="Acceso exclusivo para personal de Grupo La Paz.">
      <FormEntrar />
    </PantallaAcceso>
  );
}
