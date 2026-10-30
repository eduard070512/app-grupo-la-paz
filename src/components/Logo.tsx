import Image from "next/image";

export function LogoHorizontal({ className = "h-10 w-auto" }: { className?: string }) {
  return <Image src="/brand/logo-grupo-horizontal.jpg" alt="La Paz Grupo Funerario" width={1600} height={524} className={className} priority />;
}

/** Paloma + texto en blanco para fondos morados */
export function LogoClaro({ subtitulo = "GRUPO FUNERARIO" }: { subtitulo?: string }) {
  return (
    <div className="flex items-center gap-3 text-white">
      <span className="grid h-11 w-11 place-items-center rounded-full ring-2 ring-oro-500/80">
        <Paloma className="h-6 w-6 text-oro-300" />
      </span>
      <span className="leading-none">
        <span className="block font-serif text-2xl font-semibold tracking-[.12em]">LA PAZ</span>
        <span className="mt-1 block text-[10px] tracking-[.28em] text-paz-200">{subtitulo}</span>
      </span>
    </div>
  );
}

export function Paloma({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="currentColor" className={className} aria-hidden>
      <path d="M52 6c-6 6-10 14-12 22-3-6-9-11-16-13 3 5 4 10 3 15l-9 3c-3 1-6 3-8 5 4 0 7 0 10 1-2 2-3 5-3 8 3-3 7-5 11-5 9-1 17-6 21-14 3-7 4-15 3-22z" />
      <path d="M14 50c8 4 20 4 30-1-9 6-21 8-31 5z" opacity=".8" />
    </svg>
  );
}
