export const WHATSAPP_NUMERO = process.env.WHATSAPP_NUMERO || "523121223211";

export function linkWhatsApp(mensaje: string, numero = WHATSAPP_NUMERO) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export function mensajeEmpleado(empresa: string, extra?: string) {
  return (
    `Hola, soy colaborador(a) de *${empresa}*, empresa afiliada a Grupo La Paz. ` +
    `Me gustaría agendar una cita con ustedes para conocer los planes y beneficios que tengo como empleado.` +
    (extra ? `\n\n${extra}` : "")
  );
}

export function mensajeCliente(nombre: string, contrato?: string, asunto?: string) {
  return (
    `Hola, soy ${nombre}` +
    (contrato ? `, titular del contrato *${contrato}*` : "") +
    ` de Grupo La Paz. ` +
    (asunto ?? "Me gustaría recibir información.")
  );
}
