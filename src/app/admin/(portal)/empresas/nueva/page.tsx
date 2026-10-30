import { Encabezado } from "@/components/Piezas";
import { FormEmpresa } from "../FormEmpresa";

export const metadata = { title: "Nueva empresa" };

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl">
      <Encabezado titulo="Nueva empresa afiliada" texto="Comparte el usuario y la contraseña con Recursos Humanos de la empresa." />
      <div className="tarjeta p-5"><FormEmpresa /></div>
    </div>
  );
}
