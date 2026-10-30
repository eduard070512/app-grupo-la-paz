import { Encabezado, TarjetaAliado, Vacio } from "@/components/Piezas";
import { aliadosVisibles } from "@/lib/consultas";

export const metadata = { title: "Empresas aliadas" };

export default async function Page() {
  const aliados = await aliadosVisibles();
  return (
    <>
      <Encabezado
        titulo="Empresas aliadas"
        texto="Empresas que confían en Grupo La Paz para cuidar a sus colaboradores. Como cliente, aprovecha sus beneficios especiales."
      />
      {aliados.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aliados.map((e) => (
            <TarjetaAliado key={e.id} empresa={e} />
          ))}
        </div>
      ) : (
        <Vacio>Muy pronto verás aquí a nuestras empresas aliadas.</Vacio>
      )}
    </>
  );
}
