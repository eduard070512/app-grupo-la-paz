"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { enmascararTelefono, normalizarContrato, normalizarTelefono } from "@/lib/formato";
import { enviarEventoN8n, modoDemo } from "@/lib/n8n";
import {
  bloqueado,
  buscarTokenRecuperacion,
  crearCodigo,
  crearTokenRecuperacion,
  hashContrasena,
  MENSAJE_BLOQUEO,
  registrarIntento,
  validarCodigo,
  validarContrasena,
  verificarContrasena,
} from "@/lib/seguridad";
import { errorDeConfiguracion } from "@/lib/sesion-token";
import {
  borrarTicketActivacion,
  cerrarSesion,
  guardarTicketActivacion,
  iniciarSesion,
  leerTicketActivacion,
  requerirSesion,
} from "@/lib/sesion";
import { linkWhatsApp, mensajeCliente } from "@/lib/whatsapp";

export type Estado = { error?: string; ok?: string; demo?: string; paso?: "datos" | "codigo" | "contrasena"; telefono?: string; url?: string } | undefined;

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

// ───────────── Iniciar sesión ─────────────
export async function entrar(_: Estado, f: FormData): Promise<Estado> {
  const config = errorDeConfiguracion();
  if (config) return { error: config };
  const identificador = s(f, "identificador");
  const contrasena = s(f, "contrasena");
  if (!identificador || !contrasena) return { error: "Escribe tu número de contrato (o correo) y tu contraseña." };

  const esCorreo = identificador.includes("@");
  const clave = `cliente:${identificador.toLowerCase()}`;
  if (await bloqueado(clave)) return { error: MENSAJE_BLOQUEO };

  const cliente = esCorreo
    ? await db.cliente.findUnique({ where: { email: identificador.toLowerCase() } })
    : (await db.contrato.findUnique({ where: { numero: normalizarContrato(identificador) }, include: { cliente: true } }))?.cliente;

  if (cliente && !cliente.passwordHash) {
    return { error: "Tu cuenta aún no está activada. Usa «Activar mi cuenta» con tu número de contrato y teléfono." };
  }
  if (!cliente || !(await verificarContrasena(contrasena, cliente.passwordHash))) {
    await registrarIntento(clave, false);
    return { error: "Los datos no coinciden. Revisa tu número de contrato y contraseña." };
  }
  await registrarIntento(clave, true);
  await db.cliente.update({ where: { id: cliente.id }, data: { ultimoAcceso: new Date() } });
  await iniciarSesion("cliente", cliente.id, cliente.nombre);
  redirect("/clientes");
}

// ───────────── Activación: paso 1 (contrato + teléfono) ─────────────
export async function iniciarActivacion(_: Estado, f: FormData): Promise<Estado> {
  const config = errorDeConfiguracion();
  if (config) return { error: config };
  const numero = normalizarContrato(s(f, "contrato"));
  const telefono = normalizarTelefono(s(f, "telefono"));
  if (!numero || telefono.length !== 10) return { paso: "datos", error: "Escribe tu número de contrato y tu teléfono a 10 dígitos." };

  const clave = `activacion:${numero}`;
  if (await bloqueado(clave)) return { paso: "datos", error: MENSAJE_BLOQUEO };

  const contrato = await db.contrato.findUnique({ where: { numero }, include: { cliente: true } });
  if (!contrato || normalizarTelefono(contrato.cliente.telefono) !== telefono) {
    await registrarIntento(clave, false);
    return {
      paso: "datos",
      error: "No encontramos un contrato con esos datos. Verifica el número de contrato y el teléfono registrado, o contáctanos por WhatsApp.",
    };
  }
  if (contrato.cliente.passwordHash) {
    return { paso: "datos", error: "Esta cuenta ya está activada. Inicia sesión o usa «Olvidé mi contraseña»." };
  }
  await registrarIntento(clave, true);

  const codigo = await crearCodigo(contrato.clienteId, "ACTIVACION", 10);
  await enviarEventoN8n({
    evento: "cliente.codigo_activacion",
    datos: { nombre: contrato.cliente.nombre, telefono, contrato: numero, codigo, minutosVigencia: 10 },
  });
  await guardarTicketActivacion({ clienteId: contrato.clienteId, etapa: "codigo" });
  return {
    paso: "codigo",
    telefono: enmascararTelefono(telefono),
    demo: modoDemo() ? `Modo demo: tu código es ${codigo}. En producción llega por WhatsApp/SMS vía n8n.` : undefined,
  };
}

// ───────────── Activación: paso 2 (código) ─────────────
export async function verificarCodigoActivacion(prev: Estado, f: FormData): Promise<Estado> {
  const ticket = await leerTicketActivacion();
  if (!ticket) return { paso: "datos", error: "La sesión de activación expiró. Vuelve a empezar." };
  const r = await validarCodigo(ticket.clienteId, "ACTIVACION", s(f, "codigo"));
  if (!r.ok) return { ...prev, paso: "codigo", error: r.error, demo: undefined };
  await guardarTicketActivacion({ clienteId: ticket.clienteId, etapa: "contrasena" });
  return { paso: "contrasena" };
}

// ───────────── Activación: paso 3 (correo + contraseña) ─────────────
export async function completarActivacion(_: Estado, f: FormData): Promise<Estado> {
  const ticket = await leerTicketActivacion();
  if (!ticket || ticket.etapa !== "contrasena") return { paso: "datos", error: "La sesión de activación expiró. Vuelve a empezar." };
  const email = s(f, "email").toLowerCase();
  const contrasena = s(f, "contrasena");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { paso: "contrasena", error: "El correo no parece válido." };
  if (contrasena !== s(f, "confirmar")) return { paso: "contrasena", error: "Las contraseñas no coinciden." };
  const err = validarContrasena(contrasena);
  if (err) return { paso: "contrasena", error: err };
  if (email && (await db.cliente.findFirst({ where: { email, NOT: { id: ticket.clienteId } } }))) {
    return { paso: "contrasena", error: "Ese correo ya está registrado en otra cuenta." };
  }
  const cliente = await db.cliente.update({
    where: { id: ticket.clienteId },
    data: { email: email || null, passwordHash: await hashContrasena(contrasena), activadoEn: new Date(), ultimoAcceso: new Date() },
    include: { contratos: { take: 1 } },
  });
  await borrarTicketActivacion();
  await enviarEventoN8n({
    evento: "cliente.cuenta_activada",
    datos: { nombre: cliente.nombre, telefono: cliente.telefono, email: cliente.email, contrato: cliente.contratos[0]?.numero ?? "" },
  });
  await iniciarSesion("cliente", cliente.id, cliente.nombre);
  redirect("/clientes?bienvenida=1");
}

// ───────────── Recuperar contraseña ─────────────
export async function solicitarRecuperacion(_: Estado, f: FormData): Promise<Estado> {
  const config = errorDeConfiguracion();
  if (config) return { error: config };
  const identificador = s(f, "identificador");
  if (!identificador) return { error: "Escribe tu número de contrato o tu correo." };
  const clave = `recuperar:${identificador.toLowerCase()}`;
  if (await bloqueado(clave)) return { error: MENSAJE_BLOQUEO };
  await registrarIntento(clave, false); // cuenta como intento para limitar abusos

  const cliente = identificador.includes("@")
    ? await db.cliente.findUnique({ where: { email: identificador.toLowerCase() } })
    : (await db.contrato.findUnique({ where: { numero: normalizarContrato(identificador) }, include: { cliente: true } }))?.cliente;

  const generico = "Si los datos corresponden a una cuenta activa, te enviamos un enlace para crear una nueva contraseña. Revisa tu correo o WhatsApp.";
  if (!cliente || !cliente.passwordHash) return { ok: generico };

  const token = await crearTokenRecuperacion(cliente.id, 30);
  const link = `${process.env.APP_URL ?? "http://localhost:3000"}/clientes/restablecer?token=${token}`;
  await enviarEventoN8n({
    evento: "cliente.recuperar_contrasena",
    datos: { nombre: cliente.nombre, canal: cliente.email ? "email" : "whatsapp", email: cliente.email, telefono: cliente.telefono, link, minutosVigencia: 30 },
  });
  return { ok: generico, demo: modoDemo() ? link : undefined };
}

export async function restablecer(_: Estado, f: FormData): Promise<Estado> {
  const token = s(f, "token");
  const contrasena = s(f, "contrasena");
  if (contrasena !== s(f, "confirmar")) return { error: "Las contraseñas no coinciden." };
  const err = validarContrasena(contrasena);
  if (err) return { error: err };
  const registro = await buscarTokenRecuperacion(token);
  if (!registro) return { error: "El enlace expiró o ya fue usado. Solicita uno nuevo." };
  await db.$transaction([
    db.cliente.update({ where: { id: registro.clienteId }, data: { passwordHash: await hashContrasena(contrasena) } }),
    db.codigoVerificacion.update({ where: { id: registro.id }, data: { usadoEn: new Date() } }),
  ]);
  await iniciarSesion("cliente", registro.cliente.id, registro.cliente.nombre);
  redirect("/clientes");
}

// ───────────── Dentro del portal ─────────────
export async function salir() {
  await cerrarSesion("cliente");
  redirect("/clientes/entrar");
}

export async function cambiarContrasena(_: Estado, f: FormData): Promise<Estado> {
  const sesion = await requerirSesion("cliente");
  const cliente = await db.cliente.findUnique({ where: { id: sesion.sub } });
  if (!cliente || !(await verificarContrasena(s(f, "actual"), cliente.passwordHash))) return { error: "La contraseña actual no es correcta." };
  const nueva = s(f, "nueva");
  if (nueva !== s(f, "confirmar")) return { error: "Las contraseñas no coinciden." };
  const err = validarContrasena(nueva);
  if (err) return { error: err };
  await db.cliente.update({ where: { id: cliente.id }, data: { passwordHash: await hashContrasena(nueva) } });
  return { ok: "Tu contraseña se actualizó." };
}

export async function actualizarCorreo(_: Estado, f: FormData): Promise<Estado> {
  const sesion = await requerirSesion("cliente");
  const email = s(f, "email").toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "El correo no parece válido." };
  if (email && (await db.cliente.findFirst({ where: { email, NOT: { id: sesion.sub } } }))) return { error: "Ese correo ya está registrado." };
  await db.cliente.update({ where: { id: sesion.sub }, data: { email: email || null } });
  revalidatePath("/clientes/cuenta");
  return { ok: "Correo actualizado." };
}

/** Registra la solicitud y devuelve el link de WhatsApp con el mensaje listo */
export async function contactarAsesor(_: Estado, f: FormData): Promise<Estado> {
  const sesion = await requerirSesion("cliente");
  const cliente = await db.cliente.findUnique({ where: { id: sesion.sub } });
  if (!cliente) return { error: "Sesión no válida." };
  const contrato = s(f, "contrato") || undefined;
  const motivo = s(f, "motivo") || "Información general";
  const mensaje = mensajeCliente(cliente.nombre, contrato, s(f, "texto") || `Me gustaría hablar con un asesor sobre: ${motivo}.`);
  await db.solicitud.create({
    data: { origen: "CLIENTE", clienteId: cliente.id, nombre: cliente.nombre, telefono: cliente.telefono, motivo, mensaje },
  });
  await enviarEventoN8n({
    evento: "solicitud.creada",
    datos: { origen: "CLIENTE", empresa: null, nombre: cliente.nombre, telefono: cliente.telefono, motivo, modalidad: null, preferencia: null, mensaje },
  });
  return { url: linkWhatsApp(mensaje) };
}
