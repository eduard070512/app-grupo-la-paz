"use client";
import { createContext, startTransition, useContext } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, FlaskConical, Loader2 } from "lucide-react";

const Pendiente = createContext(false);

/**
 * Formulario que NO se limpia después de enviar (React 19 reinicia los <form action>),
 * para que el usuario no pierda lo que escribió si hay un error.
 */
export function Formulario({
  accion,
  pendiente,
  children,
  className,
}: {
  accion: (f: FormData) => void;
  pendiente: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Pendiente.Provider value={pendiente}>
      <form
        className={className}
        onSubmit={(e) => {
          e.preventDefault();
          const datos = new FormData(e.currentTarget);
          startTransition(() => accion(datos));
        }}
      >
        {children}
      </form>
    </Pendiente.Provider>
  );
}

export function BotonEnviar({ children, className = "btn-primario w-full", pendiente = "Procesando…" }: { children: React.ReactNode; className?: string; pendiente?: string }) {
  const status = useFormStatus();
  const enContexto = useContext(Pendiente);
  const pending = status.pending || enContexto;
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> {pendiente}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function Alerta({ tipo = "error", children }: { tipo?: "error" | "exito" | "demo"; children: React.ReactNode }) {
  const estilos = {
    error: "bg-red-50 text-red-800 ring-red-200",
    exito: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    demo: "bg-amber-50 text-amber-900 ring-amber-200",
  }[tipo];
  const Icono = { error: AlertCircle, exito: CheckCircle2, demo: FlaskConical }[tipo];
  return (
    <div role={tipo === "error" ? "alert" : "status"} className={`flex gap-2.5 rounded-xl px-4 py-3 text-sm ring-1 ${estilos}`}>
      <Icono className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
