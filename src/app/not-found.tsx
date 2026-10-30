import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <p className="titulo text-5xl">404</p>
        <p className="mt-2 text-gris">No encontramos lo que buscas.</p>
        <Link href="/" className="btn-primario mt-6">Volver al inicio</Link>
      </div>
    </div>
  );
}
