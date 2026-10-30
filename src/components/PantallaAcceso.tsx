import Link from "next/link";
import { LogoClaro } from "./Logo";

/** Marco visual para login / activación / recuperación */
export function PantallaAcceso({
  subtitulo,
  titulo,
  texto,
  children,
  pie,
}: {
  subtitulo: string;
  titulo: string;
  texto?: React.ReactNode;
  children: React.ReactNode;
  pie?: React.ReactNode;
}) {
  return (
    <div className="fondo-marca flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-8 pt-[max(2rem,env(safe-area-inset-top))]">
        <Link href="/" className="mb-8 self-center">
          <LogoClaro subtitulo={subtitulo} />
        </Link>
        <div className="tarjeta p-6 sm:p-8">
          <h1 className="titulo text-3xl">{titulo}</h1>
          {texto && <div className="mt-1.5 text-sm text-gris">{texto}</div>}
          <div className="mt-6">{children}</div>
        </div>
        {pie && <div className="mt-6 text-center text-sm text-paz-200">{pie}</div>}
      </div>
    </div>
  );
}
