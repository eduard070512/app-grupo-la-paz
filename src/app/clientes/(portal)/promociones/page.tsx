import { Encabezado, TarjetaPromocion, Vacio } from "@/components/Piezas";
import { promocionesVigentes } from "@/lib/consultas";

export const metadata = { title: "Promociones" };

export default async function Page() {
  const promos = await promocionesVigentes("CLIENTES");
  return (
    <>
      <Encabezado titulo="Promociones" texto="Beneficios exclusivos para clientes de Grupo La Paz." />
      {promos.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {promos.map((p) => (
            <TarjetaPromocion key={p.id} promo={p} />
          ))}
        </div>
      ) : (
        <Vacio>Por ahora no hay promociones activas. ¡Vuelve pronto!</Vacio>
      )}
    </>
  );
}
