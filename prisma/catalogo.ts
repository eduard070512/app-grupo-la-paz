/**
 * Catálogo de planes de Grupo La Paz.
 * Fuente: "Catálogo Actual mar 2026" + "Sistema de Cobertura Familiar" + "Italia con Capilla 2026".
 * Montos en pesos (o dólares si moneda = USD); el seed los convierte a centavos.
 */

type Abonos = { SEMANAL?: number; QUINCENAL?: number; MENSUAL?: number };
export type VarianteCatalogo = { nombre: string; precio: number; inicial: number; abonos: Abonos; nota?: string };
export type PlanCatalogo = {
  codigo: string;
  nombre: string;
  categoria: string;
  funeraria: "la-paz" | "magana" | "ramos" | null;
  subtitulo?: string;
  resumen: string;
  moneda?: "MXN" | "USD";
  incluye: string[];
  beneficios: string[];
  cremacion?: string[];
  plazos: Abonos;
  variantes: VarianteCatalogo[];
  aplicaPara?: string;
  notas?: string;
  imagen: string; // nombre base en /public/planes
};

const v = (nombre: string, precio: number, inicial: number, abonos: Abonos, nota?: string): VarianteCatalogo => ({ nombre, precio, inicial, abonos, nota });

// --- Beneficios comunes ---
const BENEFICIOS_LA_PAZ = [
  "Facilidad de pagos",
  "100% transferible",
  "Gestión de trámites",
  "Transparencia y confiabilidad",
  "Precio congelado sin intereses",
  "No tiene fecha de caducidad",
  "Doble seguro para el titular",
];
const BENEFICIOS_MAGANA = [
  "Precio congelado",
  "Áreas confortables",
  "Capilla",
  "Cafetería 24 horas",
  "Red WiFi",
  "Plan transferible",
  "Sistema de vigilancia de circuito cerrado",
  "Habitación de descanso para la familia",
  "Zona de recepción",
];
const PLAZO_MAGANA = { MENSUAL: 35 };
const PLAZO_LA_PAZ = { SEMANAL: 156, QUINCENAL: 72, MENSUAL: 36 };

const BASE_MAGANA = [
  "Atención personalizada 24/7",
  "Acompañamiento tanatológico",
  "Traslado inicial a la casa funeraria",
  "Asesoría en trámites oficiales",
  "Gestoría en trámites oficiales",
  "Arreglo estético",
  "Renta de sala de velación hasta por 24 horas",
  "Cafetería ilimitada (café, té, refresco y botellas de agua)",
  "100 piezas de pan tradicional",
  "1 mesero durante todo el servicio",
  "Desayuno tipo americano para 20 personas (café, jugo, sándwich y frutas)",
  "1 fotografía con marco tamaño 40 x 50 cm",
  "Esquela digital en sala",
  "Esquela digital en redes sociales",
  "25 esquelas impresas",
  "20 sillas en calidad de préstamo para novenario",
  "Carroza para cortejo",
];

const CAPILLA_DOMICILIO = (sillas: number, toldo: string, cafeteria: string) => [
  "Capilla de velación a domicilio hasta por 24 horas (4 candeleros, 4 velas, 1 crucifijo, 1 pedestal y 1 biombo)",
  `${sillas} sillas en calidad de préstamo hasta por 24 horas`,
  `1 toldo ${toldo} hasta por 24 horas`,
  cafeteria,
  "1 fotografía con marco tamaño carta",
  "Esquela digital en redes sociales",
  "25 esquelas impresas",
];
const CAFETERIA_100 = "Cafetería para 100 personas (1 kg de café, 100 vasos térmicos, 100 cucharas cafeteras, 1 kg de azúcar, 1 kg de galletas)";
const BASE_LA_PAZ = [
  "Atención profesional personalizada 24/7",
  "Traslado inicial a la casa funeraria",
  "Acompañamiento tanatológico",
  "Asesoría en trámites oficiales",
  "Gestoría en trámites oficiales",
];

const COBERTURA_FAMILIAR = (ataud: string) => [
  "Atención personalizada 24/7",
  "Renta de sala de velación en Capilla Funeraria La Paz 24 hrs.",
  `Ataúd modelo ${ataud}`,
  "Traslado inicial a casa funeraria",
  "Embalsamado",
  "Arreglo estético",
  "Asesoría y gestoría en trámites oficiales",
  "Pago de trámites oficiales",
  "Acompañamiento tanatológico desde manejo de noticias",
  "Grupo de apoyo de asistencia para el manejo del duelo",
  "Servicio de cafetería ilimitada (café, té, refresco y agua)",
  "100 piezas de pan tradicional",
  "Carroza para cortejo",
  "Kit luctuoso (25 esquelas impresas, guía de rosarios, rosario y moño luctuoso) con esquela digital",
  "Servicio de cremación para una mascota al año (con peso previamente declarado en contrato)",
];

export const CATALOGO: PlanCatalogo[] = [
  // ───────────── Sistema de Cobertura Familiar (SCF) ─────────────
  {
    codigo: "CF-DIAMANTE",
    nombre: "Cobertura Familiar Diamante",
    categoria: "COBERTURA_FAMILIAR",
    funeraria: null,
    subtitulo: "Sistema Mexicano de Cobertura Familiar",
    resumen: "Protección familiar integral en una sola inversión: ataúd modelo Bosnia, sala de velación 24 hrs, embalsamado y acompañamiento tanatológico.",
    incluye: COBERTURA_FAMILIAR("Bosnia"),
    beneficios: ["Toma de decisión anticipada que genera confianza", "Protección económica y ahorro significativo", "Apoyo tanatológico desde el manejo de noticias"],
    cremacion: ["Ataúd modelo Bosnia en calidad de renta", "Urna modelo Esmeralda", "Cremación"],
    plazos: { MENSUAL: 12 },
    variantes: [v("Cobertura Familiar Diamante", 7200, 0, { MENSUAL: 600 }, "O un solo pago de contado de $7,200")],
    aplicaPara: "Titular (y cónyuge) menor a 64 años, padres hasta 74 años, hijos (todos) hasta 25 años. Incluye un servicio de cremación para mascotas al año.",
    imagen: "cf-diamante",
  },
  {
    codigo: "CF-PLATINO",
    nombre: "Cobertura Familiar Platino",
    categoria: "COBERTURA_FAMILIAR",
    funeraria: null,
    subtitulo: "Sistema Mexicano de Cobertura Familiar",
    resumen: "Protección familiar integral en una sola inversión: ataúd modelo Italia, sala de velación 24 hrs, embalsamado y kit luctuoso.",
    incluye: COBERTURA_FAMILIAR("Italia"),
    beneficios: ["Toma de decisión anticipada que genera confianza", "Protección económica y ahorro significativo", "Apoyo tanatológico desde el manejo de noticias"],
    cremacion: ["Ataúd modelo Italia en calidad de renta", "Urna modelo Esmeralda", "Cremación"],
    plazos: { MENSUAL: 12 },
    variantes: [v("Cobertura Familiar Platino", 6000, 0, { MENSUAL: 500 }, "O un solo pago de contado de $6,000")],
    aplicaPara: "Titular (y cónyuge) menor a 64 años, padres hasta 74 años, hijos (todos) hasta 25 años. Incluye un servicio de cremación para mascotas al año.",
    imagen: "cf-platino",
  },

  // ───────────── La Paz ─────────────
  {
    codigo: "LP-MONACO",
    nombre: "Mónaco",
    categoria: "PREVISION",
    funeraria: "la-paz",
    subtitulo: "Ataúd de madera medio lecho tapa tipo bóveda",
    resumen: "Plan de previsión con ataúd Mónaco, embalsamado natural y capilla de velación a domicilio con toldo y cafetería para 100 personas.",
    incluye: ["Ataúd modelo Mónaco", ...BASE_LA_PAZ, "Embalsamado natural", "Arreglo estético", ...CAPILLA_DOMICILIO(100, "5x5", CAFETERIA_100), "Kit luctuoso (moño luctuoso, guía de rosario y rosario)", "20 sillas en calidad de préstamo para novenario", "Carroza para cortejo"],
    beneficios: BENEFICIOS_LA_PAZ,
    cremacion: ["Renta de ataúd modelo Mónaco", "Servicio de cremación", "Urna modelo Diamante"],
    plazos: PLAZO_LA_PAZ,
    variantes: [v("1 servicio", 39000, 1000, { SEMANAL: 244, QUINCENAL: 528, MENSUAL: 1055 })],
    imagen: "lp-monaco",
  },
  {
    codigo: "LP-BOSNIA",
    nombre: "Bosnia",
    categoria: "PREVISION",
    funeraria: "la-paz",
    subtitulo: "Ataúd de madera medio cristal tapa tipo bóveda",
    resumen: "Plan de previsión con ataúd Bosnia y capilla de velación a domicilio con toldo y cafetería para 100 personas.",
    incluye: ["Ataúd modelo Bosnia", ...BASE_LA_PAZ, "Arreglo estético", ...CAPILLA_DOMICILIO(100, "5x5", CAFETERIA_100), "Kit luctuoso (moño luctuoso, guía de rosario y rosario)", "20 sillas en calidad de préstamo para novenario", "Carroza para cortejo"],
    beneficios: BENEFICIOS_LA_PAZ,
    cremacion: ["Renta de ataúd modelo Bosnia", "Servicio de cremación", "Urna de madera modelo Esmeralda"],
    plazos: PLAZO_LA_PAZ,
    variantes: [
      v("1 servicio", 29700, 500, { SEMANAL: 187, QUINCENAL: 406, MENSUAL: 811 }),
      v("2 servicios", 53262, 750, { SEMANAL: 337, QUINCENAL: 729, MENSUAL: 1459 }),
      v("3 servicios", 70493, 1000, { SEMANAL: 445, QUINCENAL: 965, MENSUAL: 1930 }),
    ],
    imagen: "lp-bosnia",
  },
  {
    codigo: "LP-ITALIA",
    nombre: "Italia",
    categoria: "PREVISION",
    funeraria: "la-paz",
    subtitulo: "Ataúd de madera tapa plana",
    resumen: "Plan de previsión con ataúd Italia y capilla de velación a domicilio con toldo y cafetería para 100 personas.",
    incluye: ["Ataúd modelo Italia", ...BASE_LA_PAZ, "Arreglo estético", ...CAPILLA_DOMICILIO(100, "5x5", CAFETERIA_100), "20 sillas en calidad de préstamo para novenario", "Carroza para cortejo"],
    beneficios: BENEFICIOS_LA_PAZ,
    cremacion: ["Renta de ataúd modelo Italia", "Servicio de cremación", "Urna de madera modelo Zafiro"],
    plazos: PLAZO_LA_PAZ,
    variantes: [
      v("1 servicio", 24725, 500, { SEMANAL: 155, QUINCENAL: 336, MENSUAL: 673 }),
      v("2 servicios", 41886, 750, { SEMANAL: 264, QUINCENAL: 571, MENSUAL: 1143 }),
      v("3 servicios", 55436, 1000, { SEMANAL: 349, QUINCENAL: 756, MENSUAL: 1512 }),
    ],
    imagen: "lp-italia",
  },
  {
    codigo: "LP-ITALIA-CAPILLA",
    nombre: "Combo Italia + Capilla",
    categoria: "PREVISION",
    funeraria: "la-paz",
    subtitulo: "Ataúd de madera tapa plana + uso de capilla",
    resumen: "Ataúd Italia más uso de instalaciones hasta por 24 horas, cafetería ilimitada, pan y mesero.",
    incluye: ["Ataúd de madera tapa plana modelo Italia", "Uso de instalaciones hasta por 24 horas", "Cafetería tradicional ilimitada (café, té, refresco)", "100 piezas de pan tradicional", "Servicio de mesero durante 8 horas"],
    beneficios: BENEFICIOS_LA_PAZ,
    cremacion: ["Renta de ataúd modelo Italia", "Servicio de cremación", "Urna de madera modelo Zafiro"],
    plazos: PLAZO_LA_PAZ,
    variantes: [
      v("Colima", 32000, 750, { SEMANAL: 200, QUINCENAL: 441, MENSUAL: 868 }),
      v("Zapotiltic", 31925, 500, { SEMANAL: 200, QUINCENAL: 435, MENSUAL: 870 }),
    ],
    imagen: "lp-italia-capilla",
  },
  {
    codigo: "LP-TAPIZADO",
    nombre: "Tapizado",
    categoria: "PREVISION",
    funeraria: "la-paz",
    subtitulo: "Ataúd de madera forrado de tela",
    resumen: "Plan de previsión accesible con capilla de velación a domicilio, toldo y cafetería para 50 personas.",
    incluye: [
      "Ataúd modelo Tapizado",
      ...BASE_LA_PAZ,
      "Arreglo estético",
      ...CAPILLA_DOMICILIO(50, "chico", "Cafetería para 50 personas (½ kg de café, 50 vasos térmicos, 50 cucharas cafeteras, ½ kg de azúcar, ½ kg de galletas)"),
      "Kit luctuoso (moño luctuoso, guía de rosario y rosario)",
      "Carroza para cortejo",
    ],
    beneficios: BENEFICIOS_LA_PAZ,
    plazos: PLAZO_LA_PAZ,
    variantes: [
      v("1 servicio", 12900, 500, { SEMANAL: 79, QUINCENAL: 172, MENSUAL: 344 }),
      v("2 servicios", 22057, 750, { SEMANAL: 137, QUINCENAL: 296, MENSUAL: 592 }),
      v("3 servicios", 29192, 1000, { SEMANAL: 181, QUINCENAL: 392, MENSUAL: 783 }),
    ],
    imagen: "lp-tapizado",
  },
  {
    codigo: "LP-CREMACION-DIRECTA",
    nombre: "Cremación Directa",
    categoria: "CREMACION",
    funeraria: "la-paz",
    subtitulo: "Urna de madera modelo Zafiro",
    resumen: "Traslado, resguardo, gestión de trámites y cremación con urna de madera Zafiro.",
    incluye: [
      "Traslado de su familiar del hospital o domicilio a nuestra casa funeraria",
      "Resguardo en nuestras instalaciones mientras se realizan trámites oficiales",
      "Gestión de trámites para la tranquilidad de usted y su familia",
      "Urna de madera modelo Zafiro",
      "Esquela digital en redes sociales",
      "Acompañamiento tanatológico",
    ],
    beneficios: BENEFICIOS_LA_PAZ,
    plazos: PLAZO_LA_PAZ,
    variantes: [
      v("1 servicio", 12900, 500, { SEMANAL: 80, QUINCENAL: 172, MENSUAL: 344 }),
      v("2 servicios", 22057, 750, { SEMANAL: 137, QUINCENAL: 296, MENSUAL: 592 }),
      v("3 servicios", 29192, 1000, { SEMANAL: 181, QUINCENAL: 392, MENSUAL: 783 }),
    ],
    imagen: "lp-cremacion-directa",
  },
  {
    codigo: "LP-CAPILLA",
    nombre: "Capilla",
    categoria: "CAPILLA",
    funeraria: "la-paz",
    subtitulo: "Uso de instalaciones por 6, 12 o 24 horas",
    resumen: "Uso de nuestras salas de velación con cafetería ilimitada, pan tradicional y mesero.",
    incluye: ["Uso de instalaciones hasta por 24 horas", "Cafetería tradicional ilimitada (café, té, refresco)", "100 piezas de pan tradicional", "1 mesero durante 8 horas"],
    beneficios: BENEFICIOS_LA_PAZ,
    plazos: PLAZO_LA_PAZ,
    variantes: [
      v("1 servicio · 6 horas", 2350, 500, { MENSUAL: 51 }),
      v("1 servicio · 12 horas", 4700, 500, { MENSUAL: 117 }, "Semanal / quincenal: esquema combinado"),
      v("1 servicio · 24 horas", 9400, 500, { SEMANAL: 57, QUINCENAL: 124, MENSUAL: 247 }),
      v("2 servicios · 6 horas", 3983, 750, { MENSUAL: 90 }),
      v("2 servicios · 12 horas", 7965, 750, { MENSUAL: 200 }, "Semanal / quincenal: esquema combinado"),
      v("2 servicios · 24 horas", 15930, 750, { SEMANAL: 97, QUINCENAL: 211, MENSUAL: 422 }),
      v("3 servicios · 6 horas", 5271, 1000, { MENSUAL: 119 }),
      v("3 servicios · 12 horas", 10542, 1000, { MENSUAL: 265 }, "Semanal / quincenal: esquema combinado"),
      v("3 servicios · 24 horas", 21083, 1000, { SEMANAL: 129, QUINCENAL: 279, MENSUAL: 558 }),
    ],
    imagen: "lp-capilla",
  },
  {
    codigo: "LP-NICHOS",
    nombre: "Nichos",
    categoria: "NICHO",
    funeraria: "la-paz",
    subtitulo: "Nichos para 4 u 8 urnas",
    resumen: "Un espacio digno y seguro para el descanso de tu familia. Modelos Esmeralda, Diamante y Rubí.",
    incluye: ["Nicho familiar para 4 u 8 urnas", "Modelos Esmeralda, Diamante y Rubí"],
    beneficios: BENEFICIOS_LA_PAZ,
    plazos: { MENSUAL: 20 },
    variantes: [
      v("4 urnas · Esmeralda", 17440, 1000, { MENSUAL: 822 }),
      v("4 urnas · Diamante", 18530, 1000, { MENSUAL: 877 }),
      v("4 urnas · Rubí", 16350, 1000, { MENSUAL: 767 }),
      v("8 urnas · Esmeralda", 26324, 1000, { MENSUAL: 1266 }),
      v("8 urnas · Diamante", 28204, 1000, { MENSUAL: 1360 }),
      v("8 urnas · Rubí", 24444, 1000, { MENSUAL: 1172 }),
    ],
    imagen: "lp-nichos",
  },
  {
    codigo: "LP-DEVUELVELO-A-CASA",
    nombre: "Devuélvelo a Casa",
    categoria: "DEVUELVELO_A_CASA",
    funeraria: "la-paz",
    subtitulo: "Repatriación desde Estados Unidos",
    resumen: "Devuélvelo a casa, cerca de quienes lo aman. Coordinación integral del traslado desde EE. UU. a México.",
    moneda: "USD",
    incluye: [
      "Gestión de trámites y documentación",
      "Traslado digno y seguro",
      "Coordinación total del servicio",
      "Acompañamiento humano y profesional",
      "Traslados locales y foráneos",
      "Atención y disponibilidad 24/7",
      "Respeto, dignidad y confidencialidad",
    ],
    beneficios: BENEFICIOS_LA_PAZ,
    plazos: { MENSUAL: 36 },
    variantes: [v("Plan Devuélvelo a Casa", 10700, 500, { MENSUAL: 280 })],
    notas:
      "Cobertura en México: Estado de Colima, Sur de Jalisco, Coahuayana, Aquila, Villa Victoria, Tepatepec, Coalcomán y Quitupán, Michoacán.\nCobertura en EE. UU.: todo el estado de California, Phoenix, Tucson, Las Cruces N.M., El Paso, Odessa, Fort Worth, Dallas, Austin, San Antonio, Houston, Reno y Las Vegas NV.",
    imagen: "lp-devuelvelo-a-casa",
  },
  {
    codigo: "ZOO-CREMACION",
    nombre: "Zoo Descanso · Cremación de mascota",
    categoria: "ZOO_DESCANSO",
    funeraria: null,
    subtitulo: "Un último adiós para quienes también fueron familia",
    resumen: "Cremación individual de tu mascota con urna, traslado y video del ingreso al horno crematorio.",
    incluye: [
      "Cremación individual",
      "Urna básica",
      "Traslado de domicilio al crematorio (zona conurbada)",
      "Certificación de cremación",
      "Video del ingreso de la mascota al horno crematorio",
    ],
    beneficios: ["Facilidad de pagos", "Atención con respeto y cariño"],
    plazos: { MENSUAL: 12 },
    variantes: [
      v("Raza chica · 0.1 a 10 kg", 3220, 320, { MENSUAL: 240 }),
      v("Raza mediana · 10.1 a 20 kg", 4510, 450, { MENSUAL: 340 }),
      v("Raza grande · 20.1 a 30 kg", 5715, 570, { MENSUAL: 430 }),
      v("Raza extra grande · 30.1 a 40 kg", 6920, 690, { MENSUAL: 520 }),
    ],
    imagen: "lp-zoo-descanso",
  },

  // ───────────── Funeraria Magaña ─────────────
  ...(
    [
      ["ZAFIRO", "Zafiro", "Ataúd de madera tapa plana", [], [[47814, 1328], [44845, 1246], [41838, 1162], [38848, 1079]]],
      ["ESMERALDA", "Esmeralda", "Ataúd de madera tapa plana", [], [[57762, 1604], [54152, 1504], [50542, 1404], [46932, 1304]]],
      ["DIAMANTE", "Diamante", "Ataúd de madera medio cristal tapa tipo bóveda", ["Arreglo floral cubre ataúd y dos laterales", "50 canapés", "Embalsamado"], [[68191, 1894], [63929, 1776], [59667, 1657], [55405, 1539]]],
      ["ELITE", "Élite", "Ataúd de madera medio cristal tapa tipo bóveda", ["Arreglo floral cubre ataúd y dos laterales", "100 canapés", "Embalsamado"], [[96110, 2670], [90110, 2504], [84095, 2336], [78088, 2170]]],
    ] as [string, string, string, string[], [number, number][]][]
  ).map(([clave, nombre, subtitulo, extras, precios]): PlanCatalogo => ({
    codigo: `MG-${clave}`,
    nombre,
    categoria: "PREVISION",
    funeraria: "magana",
    subtitulo,
    resumen: `Plan de previsión Funeraria Magaña con ataúd ${nombre}, sala de velación 24 hrs, desayuno para 20 personas y mesero.`,
    incluye: [`Ataúd modelo ${nombre}`, ...BASE_MAGANA, ...(extras.length ? extras : ["1 arreglo floral cubre ataúd"])],
    beneficios: BENEFICIOS_MAGANA,
    cremacion: [`Renta de ataúd modelo ${nombre}`, "Servicio de cremación", `Urna de madera modelo ${nombre}`],
    plazos: PLAZO_MAGANA,
    variantes: precios.map(([precio, mensual], n) => v(n === 0 ? "1 servicio" : `${n + 1} servicios (precio c/u)`, precio, mensual, { MENSUAL: mensual })),
    imagen: `mg-${clave.toLowerCase()}`,
  })),
  {
    codigo: "MG-PERSONALIZADO",
    nombre: "Plan Personalizado",
    categoria: "PREVISION",
    funeraria: "magana",
    subtitulo: "Sala de velación Funeraria Magaña (12 horas)",
    resumen: "Plan de previsión esencial con sala de velación por 12 horas, en modelos Diamante, Esmeralda o Zafiro.",
    incluye: [
      "Ataúd",
      "Atención personalizada 24/7",
      "Sala de velación, Funeraria Magaña (12 horas)",
      "Café americano",
      "Arreglo estético del cuerpo",
      "Gestoría en trámites oficiales",
      "Recolección de cuerpo",
      "Traslado inicial a la casa funeraria",
      "Carroza para cortejo fúnebre",
      "Esquela digital en sala",
      "Esquela digital en redes sociales",
      "1 mesero durante todo el servicio",
      "Acompañamiento tanatológico",
    ],
    beneficios: BENEFICIOS_MAGANA,
    plazos: PLAZO_MAGANA,
    variantes: [
      v("Diamante personalizado", 45400, 1261, { MENSUAL: 1261 }),
      v("Esmeralda personalizado", 35400, 983, { MENSUAL: 983 }),
      v("Zafiro personalizado", 30208, 839, { MENSUAL: 839 }),
    ],
    imagen: "mg-personalizado",
  },
  {
    codigo: "MG-CREMACION-DIRECTA",
    nombre: "Cremación Directa Magaña",
    categoria: "CREMACION",
    funeraria: "magana",
    subtitulo: "Traslado, trámites y cremación",
    resumen: "Traslado, resguardo, gestión de trámites, traslado en carroza al crematorio, urna básica y cremación.",
    incluye: [
      "Traslado de su familiar del hospital o domicilio a nuestra funeraria",
      "Resguardo en nuestras instalaciones mientras se realizan trámites",
      "Gestión y agilización de trámites",
      "Traslado en carroza al crematorio",
      "Urna básica de madera",
      "Cremación",
      "Esquela digital en redes sociales",
      "Acompañamiento tanatológico",
    ],
    beneficios: BENEFICIOS_MAGANA,
    plazos: PLAZO_MAGANA,
    variantes: [
      v("1 servicio", 17549, 487, { MENSUAL: 487 }),
      v("2 servicios", 28079, 780, { MENSUAL: 780 }),
      v("3 servicios", 39486, 1097, { MENSUAL: 1097 }),
      v("4 servicios", 45628, 1267, { MENSUAL: 1267 }),
    ],
    imagen: "mg-cremacion-directa",
  },
  {
    codigo: "MG-CAPILLA",
    nombre: "Capilla Magaña",
    categoria: "CAPILLA",
    funeraria: "magana",
    subtitulo: "Uso de instalaciones hasta por 24 horas",
    resumen: "Uso de instalaciones con cafetería ilimitada, pan, mesero de etiqueta y desayuno para la familia directa.",
    incluye: [
      "Uso de instalaciones hasta por 24 horas",
      "Cafetería tradicional ilimitada (café, té, refresco, botellas de agua)",
      "100 piezas de pan tradicional",
      "Mesero de etiqueta por todo el servicio",
      "Desayuno americano para familia directa (café, jugo, sándwich y frutas para 20 personas)",
    ],
    beneficios: BENEFICIOS_MAGANA,
    plazos: PLAZO_MAGANA,
    variantes: [
      v("1 servicio", 25070, 696, { MENSUAL: 696 }),
      v("2 servicios (precio c/u)", 21310, 592, { MENSUAL: 592 }),
      v("3 servicios (precio c/u)", 20056, 557, { MENSUAL: 557 }),
      v("4 servicios (precio c/u)", 18803, 522, { MENSUAL: 522 }),
    ],
    imagen: "mg-capilla",
  },
];
