/**
 * Datos de DEMOSTRACIÓN. Borra y vuelve a crear todo.
 * Los planes y el contenido son reales (material de La Paz); clientes y empresas son ficticios.
 *
 *   npm run db:demo
 *
 * Protección: si la base tiene clientes que no son de demo (datos reales migrados),
 * se niega a borrar nada.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATALOGO, type PlanCatalogo, type VarianteCatalogo } from "./catalogo";
import { cargarCatalogo, cargarFunerarias } from "./base";

const db = new PrismaClient();
const hash = (pw: string) => bcrypt.hashSync(pw, 10);
const c = (pesos: number) => Math.round(pesos * 100);

// PRNG determinista para que la demo sea siempre igual
let semilla = 20261030;
const azar = () => ((semilla = (semilla * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
const elegir = <T,>(a: T[]) => a[Math.floor(azar() * a.length)];

async function main() {
  const USUARIOS_DEMO = ["grupollantero", "ferrevolcan", "dentalsonrisa", "transpacifico", "cafecomala"];
  const reales =
    (await db.cliente.count({ where: { OR: [{ claveExterna: null }, { NOT: { claveExterna: { startsWith: "DEMO-" } } }] } })) +
    (await db.empresa.count({ where: { usuario: { notIn: USUARIOS_DEMO } } }));
  if (reales > 0) {
    console.error(`La base tiene ${reales} clientes/empresas que no son de demostración. Por seguridad no se borra nada.`);
    console.error("Para cargar el catálogo y el admin en una base real usa: npm run db:produccion");
    process.exit(1);
  }

  console.log("Limpiando base de datos…");
  for (const m of ["intentoAcceso", "codigoVerificacion", "solicitud", "pago", "beneficiario", "contrato", "cliente", "plan", "funeraria", "empresa", "promocion", "admin"] as const) {
    // @ts-expect-error acceso dinámico a delegados
    await db[m].deleteMany();
  }

  // --- Datos base reales: casas funerarias y catálogo ---
  const funerarias = await cargarFunerarias(db);
  const ids = await cargarCatalogo(db);
  const planes: Record<string, { id: string; variantes: VarianteCatalogo[]; plazos: PlanCatalogo["plazos"] }> = Object.fromEntries(
    CATALOGO.map((p) => [p.codigo, { id: ids[p.codigo], variantes: p.variantes, plazos: p.plazos }]),
  );

  type Esquema = { planId: string; total: number; frecuencia: string; inicial: number; abono: number; n: number };
  /** Esquema de pago real tomado de la variante del catálogo */
  const esquema = (codigo: string, variante: number, frecuencia: "SEMANAL" | "QUINCENAL" | "MENSUAL"): Esquema => {
    const pl = planes[codigo];
    const vr = pl.variantes[variante];
    return { planId: pl.id, total: c(vr.precio), frecuencia, inicial: c(vr.inicial), abono: c(vr.abonos[frecuencia]!), n: pl.plazos[frecuencia]! };
  };
  const esquemas: Esquema[] = [
    esquema("CF-DIAMANTE", 0, "MENSUAL"),
    esquema("CF-PLATINO", 0, "MENSUAL"),
    esquema("LP-ITALIA-CAPILLA", 0, "SEMANAL"),
    esquema("LP-ITALIA-CAPILLA", 0, "QUINCENAL"),
    esquema("LP-BOSNIA", 0, "MENSUAL"),
    esquema("LP-ITALIA", 0, "SEMANAL"),
    esquema("LP-TAPIZADO", 0, "QUINCENAL"),
    esquema("LP-MONACO", 0, "MENSUAL"),
    esquema("LP-CREMACION-DIRECTA", 0, "SEMANAL"),
    esquema("LP-NICHOS", 0, "MENSUAL"),
    esquema("MG-ZAFIRO", 0, "MENSUAL"),
    esquema("MG-ESMERALDA", 0, "MENSUAL"),
    esquema("MG-PERSONALIZADO", 2, "MENSUAL"),
  ];

  const hoy = new Date();
  const paso = (f: string, d: Date, k: number) => {
    const r = new Date(d);
    if (f === "SEMANAL") r.setDate(r.getDate() + 7 * k);
    else if (f === "QUINCENAL") r.setDate(r.getDate() + 15 * k);
    else r.setMonth(r.getMonth() + k);
    return r;
  };

  /** Crea contrato + pagos simulados. perfil: puntual | atrasado | liquidado */
  async function crearContrato(opts: {
    numero: string;
    clienteId: string;
    funerariaId: string;
    esquema: Esquema;
    inicio: Date;
    perfil: "puntual" | "atrasado" | "liquidado";
    beneficiarios?: { nombre: string; parentesco: string }[];
  }) {
    const { esquema: e } = opts;
    const total = e.total;
    const contrato = await db.contrato.create({
      data: {
        numero: opts.numero,
        clienteId: opts.clienteId,
        funerariaId: opts.funerariaId,
        planId: e.planId,
        fechaContratacion: opts.inicio,
        montoTotalCentavos: total,
        pagoInicialCentavos: e.inicial,
        frecuencia: e.frecuencia,
        abonoCentavos: e.abono,
        numeroAbonos: e.n,
        estatus: opts.perfil === "liquidado" ? "LIQUIDADO" : "ACTIVO",
        beneficiarios: opts.beneficiarios ? { create: opts.beneficiarios } : undefined,
      },
    });
    const pagos: { contratoId: string; fecha: Date; montoCentavos: number; metodo: string; folio: string }[] = [];
    let pagado = 0;
    const metodo = () => elegir(["EFECTIVO", "EFECTIVO", "TRANSFERENCIA", "TARJETA", "DEPOSITO"]);
    if (e.inicial > 0) {
      pagos.push({ contratoId: contrato.id, fecha: opts.inicio, montoCentavos: e.inicial, metodo: metodo(), folio: `${opts.numero}-000` });
      pagado += e.inicial;
    }
    const omitir = opts.perfil === "atrasado" ? 3 + Math.floor(azar() * 3) : 0;
    for (let k = 1; pagado < total; k++) {
      const f = paso(e.frecuencia, opts.inicio, k);
      if (opts.perfil !== "liquidado" && f > hoy) break;
      const monto = Math.min(e.abono, total - pagado);
      pagos.push({ contratoId: contrato.id, fecha: f, montoCentavos: monto, metodo: metodo(), folio: `${opts.numero}-${String(k).padStart(3, "0")}` });
      pagado += monto;
    }
    // Perfil atrasado: quitar los últimos abonos
    if (omitir) pagos.splice(Math.max(1, pagos.length - omitir));
    if (opts.perfil === "liquidado") pagos.forEach((p) => p.fecha > hoy && (p.fecha = new Date(hoy.getTime() - 86_400_000 * 3)));
    await db.pago.createMany({ data: pagos });
    return contrato;
  }

  // --- Cuentas demo documentadas ---
  const pwDemo = hash("Demo2026");
  const laPaz = funerarias[0];
  const magana = funerarias[1];

  const maria = await db.cliente.create({
    data: { nombre: "María Fernanda López Torres", telefono: "3121234567", email: "maria.demo@grupolapaz.mx", passwordHash: pwDemo, activadoEn: new Date(), funerariaId: laPaz.id, claveExterna: "DEMO-MARIA" },
  });
  await crearContrato({
    numero: "LP-10001",
    clienteId: maria.id,
    funerariaId: laPaz.id,
    esquema: esquemas[0],
    inicio: paso("MENSUAL", hoy, -5),
    perfil: "puntual",
    beneficiarios: [
      { nombre: "María Fernanda López Torres", parentesco: "TITULAR" },
      { nombre: "Ricardo Gómez Silva", parentesco: "CONYUGE" },
      { nombre: "Sofía Gómez López", parentesco: "HIJA" },
      { nombre: "Mateo Gómez López", parentesco: "HIJO" },
      { nombre: "Canela", parentesco: "MASCOTA" },
    ],
  });

  const jose = await db.cliente.create({
    data: { nombre: "José Luis Ramírez Mendoza", telefono: "3127654321", funerariaId: laPaz.id, claveExterna: "DEMO-JOSE" },
  });
  await crearContrato({ numero: "LP-10002", clienteId: jose.id, funerariaId: laPaz.id, esquema: esquemas[2], inicio: paso("MENSUAL", hoy, -14), perfil: "atrasado" });

  const rosa = await db.cliente.create({
    data: { nombre: "Rosa Elena Ruiz Contreras", telefono: "3129876543", email: "rosa.demo@grupolapaz.mx", passwordHash: pwDemo, activadoEn: new Date(), funerariaId: magana.id, claveExterna: "DEMO-ROSA" },
  });
  await crearContrato({ numero: "MG-20001", clienteId: rosa.id, funerariaId: magana.id, esquema: esquemas[10], inicio: paso("MENSUAL", hoy, -40), perfil: "liquidado" });
  await crearContrato({ numero: "MG-20002", clienteId: rosa.id, funerariaId: magana.id, esquema: esquemas[1], inicio: paso("MENSUAL", hoy, -4), perfil: "puntual" });

  // --- Clientes masivos de ejemplo ---
  const nombres = ["Juan", "Guadalupe", "Francisco", "Patricia", "Miguel Ángel", "Leticia", "Jesús", "Verónica", "Alejandro", "Claudia", "Roberto", "Gabriela", "Arturo", "Silvia", "Fernando", "Adriana", "Héctor", "Norma", "Raúl", "Elizabeth", "Sergio", "Martha", "Jorge", "Laura"];
  const apellidos = ["García", "Hernández", "Martínez", "López", "González", "Pérez", "Rodríguez", "Sánchez", "Ramírez", "Cruz", "Flores", "Gómez", "Morales", "Vázquez", "Reyes", "Jiménez", "Torres", "Díaz", "Gutiérrez", "Ruiz", "Mendoza", "Aguilar", "Ortiz", "Castillo"];
  const consecutivo: Record<string, number> = { LP: 10002, MG: 20002, RM: 30000 };
  for (let i = 0; i < 80; i++) {
    const f = azar() < 0.6 ? funerarias[0] : azar() < 0.6 ? funerarias[1] : funerarias[2];
    const cli = await db.cliente.create({
      data: {
        nombre: `${elegir(nombres)} ${elegir(apellidos)} ${elegir(apellidos)}`,
        telefono: `312${String(1000000 + Math.floor(azar() * 8999999))}`,
        funerariaId: f.id,
        claveExterna: `DEMO-${i + 1}`,
      },
    });
    const e = elegir(esquemas);
    const r = azar();
    const perfil = r < 0.68 ? "puntual" : r < 0.88 ? "atrasado" : "liquidado";
    const meses = 1 + Math.floor(azar() * Math.min(e.frecuencia === "MENSUAL" ? e.n - 1 : 30, 30));
    consecutivo[f.prefijo] += 1;
    await crearContrato({ numero: `${f.prefijo}-${consecutivo[f.prefijo]}`, clienteId: cli.id, funerariaId: f.id, esquema: e, inicio: paso("MENSUAL", hoy, -meses), perfil });
  }

  // --- Empresas afiliadas (ficticias) ---
  const empresas = [
    { slug: "grupo-llantero", nombre: "Grupo Llantero de Occidente", usuario: "grupollantero", pw: "Llantero2026", giro: "Llantas y servicio automotriz", descripcion: "Venta de llantas, alineación, balanceo y servicio automotriz en Colima.", telefono: "3123110000", direccion: "Colima, Col.", ofertaClientes: "10% en alineación y balanceo para clientes de Grupo La Paz." },
    { slug: "ferreteria-volcan", nombre: "Ferretería El Volcán", usuario: "ferrevolcan", pw: "Volcan2026", giro: "Ferretería y materiales", descripcion: "Todo para tu hogar y construcción.", telefono: "3123120000", direccion: "Villa de Álvarez, Col.", ofertaClientes: "5% de descuento en toda la tienda mostrando tu app de La Paz." },
    { slug: "dental-sonrisa", nombre: "Clínica Dental Sonrisa", usuario: "dentalsonrisa", pw: "Sonrisa2026", giro: "Salud dental", descripcion: "Odontología general y especialidades.", telefono: "3123130000", direccion: "Centro, Colima", ofertaClientes: "Limpieza dental con 20% de descuento." },
    { slug: "transportes-pacifico", nombre: "Transportes del Pacífico", usuario: "transpacifico", pw: "Pacifico2026", giro: "Logística y transporte", descripcion: "Transporte de carga en el occidente del país.", telefono: "3143140000", direccion: "Manzanillo, Col.", ofertaClientes: null },
    { slug: "cafe-comala", nombre: "Café de Comala", usuario: "cafecomala", pw: "Comala2026", giro: "Cafetería", descripcion: "Café de altura de la región.", telefono: "3123150000", direccion: "Comala, Col.", ofertaClientes: "Café americano de cortesía en tu primera visita." },
  ];
  const creadas = [];
  for (const { pw, ...e } of empresas) {
    creadas.push(await db.empresa.create({ data: { ...e, passwordHash: hash(pw), descuentoEmpleados: 15 } }));
  }

  // --- Promociones de ejemplo ---
  const en = (dias: number) => new Date(hoy.getTime() + dias * 86_400_000);
  await db.promocion.createMany({
    data: [
      { titulo: "15% de descuento para tu familia", descripcion: "Como colaborador de una empresa afiliada tienes 15% de descuento en Previsión, Cobertura Familiar, Nichos, Devuélvelo a Casa, Zoo Descanso y Necesidad Inmediata.", imagenUrl: "/galeria/descuento-15.jpg", audiencia: "EMPRESAS", orden: 1 },
      { titulo: "Cobertura Familiar Platino desde $500 al mes", descripcion: "Protege a tu cónyuge, padres e hijos con una sola inversión: 12 mensualidades de $500.", imagenUrl: "/galeria/cobertura-familiar-beneficios.jpg", audiencia: "TODOS", vigenteHasta: en(60), orden: 2 },
      { titulo: "Amplía tu protección", descripcion: "¿Ya tienes tu plan? Pregunta por la Cobertura Familiar para incluir a tus padres (hasta 74 años) e hijos (hasta 25 años). Promoción de ejemplo.", imagenUrl: "/galeria/compromiso.jpg", audiencia: "CLIENTES", vigenteHasta: en(45), orden: 3 },
      { titulo: "Salas de velación renovadas", descripcion: "Contamos con dos acogedoras salas de velación con aire acondicionado, sillones de descanso, meseros, WiFi y cafetería ilimitada.", imagenUrl: "/galeria/salas-velacion.jpg", audiencia: "TODOS", orden: 4 },
    ],
  });

  // --- Solicitudes de ejemplo ---
  await db.solicitud.createMany({
    data: [
      { origen: "EMPRESA", empresaId: creadas[0].id, nombre: "Carlos Méndez", telefono: "3121112233", motivo: "Conocer Cobertura Familiar", modalidad: "PRESENCIAL", preferencia: "Sábado por la mañana", mensaje: "Solicitud de ejemplo" },
      { origen: "EMPRESA", empresaId: creadas[2].id, nombre: "Lucía Torres", telefono: null, motivo: "Taller de duelo para mi empresa", modalidad: "LLAMADA", preferencia: "Entre semana después de las 5", mensaje: "Solicitud de ejemplo", estatus: "CONTACTADA" },
    ],
  });

  // --- Administradores ---
  await db.admin.create({ data: { nombre: "Administración La Paz", email: "admin@grupolapaz.mx", passwordHash: hash("LaPazAdmin2026") } });

  const totales = { clientes: await db.cliente.count(), contratos: await db.contrato.count(), pagos: await db.pago.count() };
  console.log("Listo:", totales);
  console.log(`
  CUENTAS DEMO
  Admin ........ admin@grupolapaz.mx / LaPazAdmin2026
  Empresa ...... grupollantero / Llantero2026   (también ferrevolcan / Volcan2026)
  Cliente ...... contrato LP-10001 / Demo2026   (María, al corriente)
  Cliente ...... contrato MG-20002 / Demo2026   (Rosa, 2 contratos, uno liquidado)
  Activación ... contrato LP-10002 + tel 3127654321 (José, cuenta sin activar, con atraso)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
