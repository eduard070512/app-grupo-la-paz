# Grupo La Paz · Plataforma digital

Plataforma web (instalable en el celular como app) para **La Paz Grupo Funerario**, que agrupa a Funeraria La Paz, Funeraria Magaña y Funerales Ramos.

Un solo proyecto con **tres portales**:

| Portal | Ruta | Para quién | Acceso |
|---|---|---|---|
| **Empresas afiliadas** | `/empresas` | Colaboradores de empresas con convenio | 1 usuario + contraseña **por empresa** (compartido con sus empleados) |
| **Mi Plan (clientes)** | `/clientes` | Clientes con contrato en cualquier casa del grupo | Número de contrato + contraseña personal |
| **Administración** | `/admin` | Personal de La Paz | Correo + contraseña |

Los portales de empresas y de clientes se pueden instalar en el celular como **apps separadas** ("Agregar a pantalla de inicio"), cada uno con su propio ícono e inicio. Más adelante se pueden publicar en dominios distintos (p. ej. `empresas.lapazgrupofunerario.com` y `miplan.lapazgrupofunerario.com`).

---

## Conectar la base de datos (Neon)

La app usa **PostgreSQL**. Recomendado: [Neon](https://neon.tech) (el plan gratuito alcanza para empezar).

1. En neon.tech crea un proyecto (región **US East**, la más cercana a México).
2. En **Connect** copia dos cadenas de conexión:
   - **Pooled** (el host contiene `-pooler`) → `DATABASE_URL`
   - **Direct** (la misma, sin `-pooler`) → `DIRECT_URL`
3. Copia `.env.example` a `.env` y pega ahí las dos cadenas. Cambia también `AUTH_SECRET` (`openssl rand -base64 48`).
4. Instala y crea las tablas:

```bash
npm install
npm run setup               # crea las tablas en Neon + carga la DEMO (clientes y empresas de prueba)
npm run dev                 # http://localhost:3000
```

**¿Base real en lugar de demo?** Define `ADMIN_EMAIL`, `ADMIN_NOMBRE` y `ADMIN_PASSWORD` en `.env` y usa:

```bash
npm run setup:produccion    # crea las tablas + casas funerarias + catálogo + tu administrador (no borra nada)
```

Después los clientes reales se cargan con **Admin → Importar** (ver *Migración*).

| Script | Qué hace |
|---|---|
| `npm run setup` | Migraciones + datos de **demo** |
| `npm run setup:produccion` | Migraciones + datos **reales** base (funerarias, planes, admin) |
| `npm run db:demo` | Recarga la demo desde cero. **Se niega a correr si detecta clientes o empresas reales.** |
| `npm run db:produccion` | Carga/actualiza funerarias, catálogo y admin. Se puede repetir; también sirve para actualizar precios tras editar `prisma/catalogo.ts`. |
| `npm run db:migrar` | Aplica migraciones pendientes del esquema |
| `npm run importar -- <tipo> <archivo.csv>` | Importación masiva desde la terminal |

> Sugerencia: crea en Neon dos *branches* — `demo` y `main` — para tener la demo y la base real separadas, cada una con sus propias cadenas de conexión.

### Publicar en Vercel
1. Importa el repositorio en vercel.com.
2. Conecta Neon: pestaña **Storage → Neon** (crea `DATABASE_URL` y `DATABASE_URL_UNPOOLED` automáticamente), **o** agrega a mano `DATABASE_URL` (y opcionalmente `DIRECT_URL`) en *Settings → Environment Variables*.
3. Agrega también:
   - `AUTH_SECRET`: cadena aleatoria de 32+ caracteres (**obligatoria**, sin ella no se puede iniciar sesión)
   - `APP_URL`: la URL pública (p. ej. `https://app-grupo-la-paz.vercel.app`)
   - `CARGA_INICIAL`: `demo` o `produccion` (si es `produccion`, agrega `ADMIN_EMAIL`, `ADMIN_NOMBRE`, `ADMIN_PASSWORD`)
   - Cuando estén listos: `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`
4. Despliega. En cada despliegue se aplican las migraciones y, **solo si la base está vacía**, se cargan los datos según `CARGA_INICIAL`. Si la base ya tiene datos, no se toca.

> Si no existe `DIRECT_URL`, las migraciones la toman de `DATABASE_URL_UNPOOLED` o de `DATABASE_URL` (`scripts/con-db.mjs`).

### Cuentas de prueba

| Tipo | Usuario | Contraseña | Qué muestra |
|---|---|---|---|
| Admin | `admin@grupolapaz.mx` | `LaPazAdmin2026` | Panel completo |
| Empresa | `grupollantero` | `Llantero2026` | Portal de empleados, 15% de descuento |
| Empresa | `ferrevolcan` | `Volcan2026` | Otra empresa afiliada |
| Cliente | contrato `LP-10001` | `Demo2026` | Cobertura Familiar al corriente, con beneficiarios |
| Cliente | contrato `MG-20002` | `Demo2026` | Clienta con 2 contratos (uno liquidado) |
| **Activación** | contrato `LP-10002` + tel `3127654321` | *(se crea en el flujo)* | Cuenta sin activar y con atraso: prueba el flujo de primera vez |

En **modo demo** (sin n8n configurado), los códigos de verificación y los enlaces de recuperación se muestran en pantalla en un aviso amarillo.

Además vienen cargados unos 80 clientes ficticios con su historial de pagos, para ver la plataforma con volumen.

---

## Qué hace cada portal

### Empresas afiliadas
- Bienvenida personalizada con el nombre de la empresa y su **% de descuento**.
- **Beneficios del convenio**: NOM-035, taller de duelo, manuales digitales, charlas de previsión y 15% de descuento.
- **Catálogo completo de planes** (La Paz, Magaña, Cobertura Familiar, Zoo Descanso), con precios **ya con el descuento aplicado**.
- **Agendar cita**: el empleado elige motivo, modalidad y horario, y se abre WhatsApp (**+52 312 122 3211**) con el mensaje ya redactado:
  > Hola, soy *Carlos Méndez*, colaborador(a) de *Grupo Llantero de Occidente*, empresa afiliada a Grupo La Paz. Me gustaría agendar una cita presencial con ustedes para: Conocer planes y beneficios…
- Botón de "Agendar por WhatsApp" con un solo toque en el inicio y en cada plan.
- Sección **La Paz**: misión, visión, valores, salas de velación, casas funerarias, cobertura nacional (ANDF) y otras empresas de la red.

### Mi Plan (clientes)
- **Mis planes**: avance de pago, cuánto falta, próximo pago, situación (al corriente / con atraso / liquidado).
- **Estado de cuenta** por contrato: totales, abonos restantes, historial completo de pagos, qué cubre el plan, personas protegidas.
- Los **2 seguros incluidos** (muerte natural y muerte accidental).
- **Líneas de atención 24 horas** siempre visibles.
- **Promociones** exclusivas para clientes.
- **Empresas aliadas**: directorio de empresas con sus ofertas para clientes de La Paz (publicidad cruzada).
- **Catálogo de planes** con botón "Me interesa" (WhatsApp con nombre y contrato).
- Botones de "Aclarar un pago" y "Ampliar mi protección".

### Administración
- Panel con indicadores: clientes, % con app activada, contratos activos, contratos con atraso, saldo por cobrar y solicitudes nuevas.
- **Clientes**: búsqueda por nombre, contrato, teléfono o correo, con paginación; ficha con edición de datos, registro y borrado de pagos, cambio de estatus y **reinicio de acceso**.
- **Nuevo contrato**: los montos se llenan solos según el plan, la variante y la frecuencia del catálogo.
- **Empresas**: alta y edición, usuario y contraseña, % de descuento, oferta para clientes y visibilidad en el directorio.
- **Promociones**: dirigidas a clientes, a empresas o a todos, con vigencia.
- **Solicitudes**: cada clic en "Agendar" o "Hablar con un asesor" queda registrado antes de abrir WhatsApp, con botón para responder.
- **Importar CSV**: migración de contratos, pagos y beneficiarios (ver abajo).

---

## Acceso de clientes: cómo funciona y por qué

Propuesta original: entrar con número de contrato + teléfono, y luego crear correo y contraseña. Lo dejé así, **con una capa extra de seguridad**:

1. **Activación (solo la primera vez):** el cliente escribe su **número de contrato y su teléfono**. Si coinciden, se envía un **código de 6 dígitos por WhatsApp/SMS** a ese teléfono (vía n8n).
   *¿Por qué el código?* El número de contrato y el teléfono aparecen en recibos y los conocen cobradores y familiares, así que no bastan para demostrar que es el titular. El código confirma que quien activa tiene el celular registrado.
2. **Crear contraseña** y, de forma **recomendada pero opcional, un correo**. Muchos clientes mayores no usan correo, y no queremos dejarlos fuera.
3. **Entradas siguientes:** número de contrato (o correo) + contraseña. La sesión dura 30 días en el celular.
4. **Recuperación:** se envía por n8n un **enlace de un solo uso que vence en 30 minutos**: **por correo** si lo registró, **por WhatsApp** si no.
5. Si nada de lo anterior funciona, el admin puede **reiniciar el acceso** y el cliente vuelve a activar con contrato + teléfono + código.

Otras medidas:
- Contraseñas cifradas con bcrypt. Los códigos y tokens se guardan como hash, nunca en claro.
- Bloqueo de 15 minutos tras 5 intentos fallidos (por contrato, usuario o correo).
- Los mensajes de recuperación no revelan si un contrato o correo existe.
- Sesiones en cookie `httpOnly` firmada. Un cliente solo puede ver sus propios contratos.

---

## Integración con n8n

La app manda **POST** al webhook definido en `N8N_WEBHOOK_URL` con este formato:

```json
{ "evento": "cliente.codigo_activacion", "datos": { ... }, "fecha": "2026-10-30T20:00:00.000Z", "app": "grupo-la-paz" }
```

Header `x-lapaz-signature`: HMAC-SHA256 del cuerpo con `N8N_WEBHOOK_SECRET`, para que n8n verifique que el envío viene de la app.

| `evento` | `datos` | Qué debe hacer n8n |
|---|---|---|
| `cliente.codigo_activacion` | `nombre, telefono, contrato, codigo, minutosVigencia` | Enviar el código por WhatsApp (o SMS) |
| `cliente.recuperar_contrasena` | `nombre, canal ("email"\|"whatsapp"), email, telefono, link, minutosVigencia` | Enviar el enlace por correo o WhatsApp según `canal` |
| `cliente.cuenta_activada` | `nombre, telefono, email, contrato` | (Opcional) mensaje de bienvenida o registro en CRM |
| `solicitud.creada` | `origen, empresa, nombre, telefono, motivo, modalidad, preferencia, mensaje` | (Opcional) avisar al equipo, registrar en CRM o agenda |

Workflow sugerido en n8n: **Webhook → Switch (por `evento`) → Gmail/SMTP · WhatsApp Business API/Twilio · Google Sheets/CRM**.

Si `N8N_WEBHOOK_URL` está vacío, la app trabaja en **modo demo**.

---

## Catálogo de planes

Los planes reales están en `prisma/catalogo.ts`, transcritos del *Catálogo Actual mar 2026*, del *Sistema de Cobertura Familiar* y de *Italia con Capilla 2026*. En total son **19 planes**:

- **La Paz:** Mónaco, Bosnia, Italia, Combo Italia + Capilla (Colima y Zapotiltic), Tapizado, Cremación Directa, Capilla (6/12/24 h), Nichos (4 y 8 urnas), Devuélvelo a Casa (USD).
- **Magaña:** Zafiro, Esmeralda, Diamante, Élite, Plan Personalizado, Cremación Directa, Capilla.
- **Grupo:** Cobertura Familiar Diamante y Platino, Zoo Descanso (cremación de mascotas).

Cada plan guarda todas sus **variantes** (1 a 4 servicios, horas, urnas, tamaño de mascota) con su precio, pago inicial y abonos semanales, quincenales o mensuales. Las imágenes de cada ficha (`public/planes/`) salen del PDF del catálogo.

Para actualizar precios, edita `prisma/catalogo.ts` y corre `npm run db:produccion` (actualiza el catálogo sin tocar clientes). Un editor de catálogo en el admin sería el siguiente paso natural.

---

## Migración de los datos reales

### 1. Base de datos de producción
Con Neon conectado (ver arriba), corre `npm run setup:produccion`. Crea las tablas, las 3 casas funerarias, el catálogo y tu usuario administrador **sin datos de prueba**.

### 2. Exportar del sistema actual a CSV
Plantillas en `public/plantillas/` (también se descargan desde **Admin → Importar**):

- `contratos.csv`: `numero_contrato, casa_funeraria, nombre_titular, telefono, email, clave_cliente, plan, fecha_contratacion, monto_total, pago_inicial, frecuencia, abono, numero_abonos, estatus, notas`
- `pagos.csv`: `numero_contrato, fecha, monto, metodo, folio`
- `beneficiarios.csv`: `numero_contrato, nombre, parentesco, fecha_nacimiento`

### 3. Importar
Orden: **contratos → pagos → beneficiarios**. Desde el panel (Admin → Importar) o, para archivos grandes, desde la terminal:

```bash
npm run importar -- contratos contratos.csv
npm run importar -- pagos pagos.csv
npm run importar -- beneficiarios beneficiarios.csv
```

Cómo se comporta la importación:
- Es **idempotente**: se puede repetir (p. ej. cada noche mientras conviven los dos sistemas) sin duplicar nada. Los contratos se actualizan por número, los pagos por folio y los clientes por `clave_cliente`.
- Genera un **reporte por fila** con los errores. Una fila mala no detiene el resto.
- Si un contrato trae un código de plan que no está en el catálogo, se crea un plan **inactivo** para no perder el contrato.
- Si un cliente tiene varios contratos (misma `clave_cliente`), ve todos en su app.

### 4. Sincronización continua (opcional)
Si el sistema actual seguirá siendo el principal para cobranza, un workflow de n8n puede exportar los pagos del día a CSV y subirlos con el script, o se puede agregar un endpoint `POST /api/pagos` protegido con token.

---

## Estructura

```
prisma/
  schema.prisma        Modelo de datos (PostgreSQL)
  migrations/          Migraciones del esquema
  catalogo.ts          Catálogo real de planes y precios
  base.ts              Carga de funerarias y catálogo (compartida)
  produccion.ts        Carga inicial de producción (funerarias, catálogo, admin)
  seed.ts              Datos de demostración
scripts/importar.ts    Importación CSV desde la terminal
src/
  middleware.ts        Protección de rutas por portal
  lib/                 Sesiones, seguridad, n8n, WhatsApp, estado de cuenta, importación, contenido
  components/          Piezas visuales compartidas
  app/
    page.tsx           Portada: elegir portal
    clientes/          Portal de clientes (acceso, activación, recuperación, Mi Plan)
    empresas/          Portal de empresas afiliadas
    admin/             Panel de administración
public/
  brand/ galeria/ planes/   Logos, imágenes y fichas del catálogo
  plantillas/               CSV de ejemplo para migración
  manifest-*.webmanifest    PWA de clientes y de empresas
```

**Tecnología:** Next.js 15 (App Router, Server Actions), React 19, Prisma 6 + PostgreSQL (Neon), Tailwind CSS 4, TypeScript.

## Pendientes y siguientes pasos sugeridos
- Confirmar teléfonos y direcciones de **Funerales Ramos** (en la demo: 341 414 0298, Zapotiltic).
- Conectar n8n (WhatsApp Business API para los códigos y SMTP para los correos).
- Logos reales de las empresas afiliadas (hoy se muestran iniciales; el admin acepta URL de logo).
- Editor del catálogo de planes y subida de imágenes en el admin.
- Notificaciones push de recordatorio de pago (vía n8n o service worker).
- Pago en línea (Mercado Pago, Stripe, OXXO) desde el estado de cuenta.
