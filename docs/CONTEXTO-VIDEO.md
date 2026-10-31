# Contexto para producir el video demo · App Grupo La Paz

> Documento para entregar a otra IA o persona que va a grabar o generar un **video demostrativo** de la plataforma. Explica qué es la app, cómo se ve, cómo navegarla paso a paso, las credenciales de demo y un guion sugerido.

---

## 1. Qué es

**La Paz Grupo Funerario** (Colima, México) agrupa tres casas funerarias: **Funeraria La Paz**, **Funeraria Magaña** y **Funerales Ramos**. La plataforma es una **web app instalable en el celular (PWA)** con tres portales:

| Portal | Ruta | Usuario | Para qué sirve |
|---|---|---|---|
| **Empresas afiliadas** | `/empresas` | Empleados de empresas con convenio. **Un solo usuario y contraseña por empresa**, compartido con todos sus empleados | Ver sus beneficios y su 15% de descuento, consultar planes con el precio rebajado y **agendar cita por WhatsApp** con mensaje predefinido |
| **Mi Plan (clientes)** | `/clientes` | Clientes que ya tienen contrato | Ver su plan, cuánto han pagado, cuánto les falta, su próximo pago, su historial de pagos, qué cubre el plan, promociones y empresas aliadas |
| **Administración** | `/admin` | Personal de La Paz | Clientes, pagos, contratos, empresas, promociones, solicitudes de cita e importación de datos |

**Idea de negocio que el video debe transmitir:**
- Una empresa (p. ej. "Grupo Llantero") se afilia a La Paz → todos sus empleados obtienen **15% de descuento** y beneficios de bienestar (talleres de duelo, cumplimiento de la NOM-035). A cambio, la empresa aparece como **aliada** dentro de la app de clientes de La Paz (publicidad cruzada).
- Los clientes de La Paz tienen **todo visible** desde el celular: plan, saldo, pagos, cobertura y promociones.
- Todo contacto termina en **WhatsApp** con el mensaje ya redactado: quién es, de qué empresa o contrato viene y qué quiere.

---

## 2. Acceso

- **URL:** la del despliegue en Vercel (pídela al dueño; tiene la forma `https://app-grupo-la-paz….vercel.app`). La portada `/` deja elegir entre "Soy cliente" y "Trabajo en una empresa afiliada". El acceso a Administración está en el pie de página.
- **WhatsApp de atención** (al que llegan todos los mensajes): **+52 312 122 3211**.
- Diseño **mobile-first**: los portales de clientes y empresas tienen barra de navegación inferior en celular. Graba esos portales en vertical (390×844) y el admin en escritorio (1366×900 o más).

### Credenciales de demo

| Rol | Usuario | Contraseña | Qué muestra |
|---|---|---|---|
| **Admin** | `admin@grupolapaz.mx` | `LaPazAdmin2026` | Panel completo |
| **Empresa** | `grupollantero` | `Llantero2026` | "Grupo Llantero de Occidente", 15% de descuento |
| Empresa | `ferrevolcan` | `Volcan2026` | "Ferretería El Volcán" |
| Empresa | `dentalsonrisa` | `Sonrisa2026` | "Clínica Dental Sonrisa" |
| **Cliente** | contrato `LP-10001` | `Demo2026` | **María Fernanda López Torres**: Cobertura Familiar Diamante, **al corriente**, con 5 beneficiarios (incluida su mascota "Canela") |
| **Cliente** | contrato `MG-20002` | `Demo2026` | **Rosa Elena Ruiz Contreras** (Magaña): **2 contratos**, uno **liquidado** (Zafiro) y otro en curso (Cobertura Familiar Platino) |
| **Activación (primera vez)** | contrato `LP-10002` + teléfono `3127654321` | *(se crea en el flujo)* | **José Luis Ramírez Mendoza**: cuenta **sin activar**, combo Italia + Capilla semanal **con atraso** |

**Importante para grabar:**
- **Modo demo:** n8n todavía no está conectado. Por eso el **código de verificación** y el **enlace de recuperación** aparecen en pantalla, en un **recuadro amarillo** que dice "Modo demo…". En producción llegan por WhatsApp o correo. Se puede mostrar y explicar así.
- **La activación de José solo funciona una vez.** Si hay que repetir la toma: entrar al Admin → Clientes → buscar "José" → **"Reiniciar acceso"**, y queda otra vez sin activar.
- **Bloqueo de seguridad:** tras **5 intentos fallidos** con el mismo contrato o usuario, el acceso se bloquea **15 minutos**. No equivocarse muchas veces seguidas.
- Las empresas y los clientes son **ficticios**. Los **planes, precios, beneficios, misión, visión y valores son reales** (vienen del catálogo oficial 2026).

---

## 3. Identidad visual

- **Colores:** morado profundo `#2e1a40` / `#3d2352` (fondos y encabezados), **dorado** `#c6a15b` (acentos y descuentos), lavanda `#f1eaf6`, fondo crema `#fbf8f3`. Verde WhatsApp `#1f9d55` en los botones de contacto.
- **Tipografía:** títulos en serif elegante (Cormorant Garamond), texto en Montserrat.
- **Logo:** paloma dentro de un círculo dorado + "LA PAZ · GRUPO FUNERARIO". Archivos en `public/brand/` (`logo-grupo-horizontal.jpg`, `logo-la-paz-funeraria.jpg`).
- **Fotos de apoyo** en `public/galeria/`: salas de velación, familia ("Compromiso con tu paz"), mapa de cobertura nacional, fachada, valores y visión. Fichas de cada plan en `public/planes/`.
- **Lemas reales** para el video: "Servicio con calidez humana" · "Compromiso con tu paz" · "Tratamos a tu familia como la nuestra" · "Prevenir es una decisión inteligente, valiente y llena de amor".
- **Tono:** cálido, sereno, respetuoso; nunca alegre ni comercial agresivo. Música suave (piano o cuerdas).

---

## 4. Recorrido pantalla por pantalla

### 4.1 Portada `/`
Fondo morado con el lema "Servicio con calidez humana". Dos botones grandes:
- **"Soy cliente de Grupo La Paz"** → `/clientes/entrar`
- **"Trabajo en una empresa afiliada"** → `/empresas/entrar`

Pie: dirección (Av. San Fernando No. 200, Centro, Colima) y enlace a "Administración".

### 4.2 Portal de EMPRESAS (con `grupollantero` / `Llantero2026`)
1. **Login** `/empresas/entrar`: campos "Usuario de la empresa" y "Contraseña" → **Entrar**.
2. **Inicio** `/empresas`: tarjeta morada "COLABORADOR DE **Grupo Llantero de Occidente**", sello dorado **15% DE DESCUENTO** y botón verde **"Agendar cita por WhatsApp"**. Debajo: accesos rápidos (Mis beneficios · Ver planes · Agendar cita), "Servicios con tu descuento" (Nichos, Cobertura Familiar, Previsión, Devuélvelo a Casa, Zoo Descanso, Necesidad Inmediata), promociones, "Conoce Grupo La Paz" y las **líneas de atención 24 horas**.
3. **Beneficios** `/empresas/beneficios`: los 5 beneficios del convenio:
   1. Mejor entorno psicosocial (NOM-035)
   2. Taller de duelo para tu equipo (35 min)
   3. Manuales digitales sobre el duelo
   4. Charlas de cultura de previsión (15 min)
   5. **15% de descuento** (tarjeta destacada en morado)

   Además: sección NOM-035 con botón "Solicitar taller para mi empresa", lista "Al contratar un plan de previsión" y tarjeta **"2 seguros incluidos"** (muerte natural y muerte accidental del titular).
4. **Planes** `/empresas/planes`: catálogo con filtros por casa (Funeraria La Paz, Funeraria Magaña, Grupo) y por categoría. Cada tarjeta muestra la etiqueta **"-15% empleado"**, el precio original tachado y el precio con descuento. Ejemplo: **Zafiro (Magaña)**, ~~$38,848~~ **$33,021** (es la opción de 4 servicios, la más barata).
5. **Detalle de plan** (p. ej. `/empresas/planes/MG-ZAFIRO` o `LP-BOSNIA`): foto, tabla **"Precios y formas de pago"** con todas las variantes (1 a 4 servicios; inicial, semanal, quincenal y mensual) con descuento, lista "Incluye", "En caso de cremación", beneficios y botones **"Me interesa este plan"** (WhatsApp directo) y **"Elegir día y modalidad"**.
6. **Agendar** `/empresas/agendar` ⭐ *(escena clave)*: formulario con Nombre, Teléfono (opcional), "¿Sobre qué quieres hablar?" (lista con todos los planes), Modalidad (**Cita presencial / Llamada / Videollamada**) y Día y horario. Abajo, en verde, una **"VISTA PREVIA DEL MENSAJE"** que se actualiza mientras se escribe. Al tocar **"Enviar por WhatsApp"** se abre WhatsApp con este texto ya escrito:
   > Hola, soy *Carlos Méndez*, colaborador(a) de *Grupo Llantero de Occidente*, empresa afiliada a Grupo La Paz.
   > Me gustaría agendar una cita presencial con ustedes para: Conocer planes y beneficios.
   > Horario de preferencia: Sábado 10 am.
   > Mi teléfono: 3121234000.
   > Entiendo que como empleado tengo 15% de descuento. ¡Gracias!

   La solicitud también queda registrada en el Admin → Solicitudes.
7. **La Paz** `/empresas/nosotros`: misión, visión, 6 valores (Humanidad, Respeto, Compasión, Integridad, Innovación, Solidaridad), salas de velación con sus comodidades, "¿Por qué prevenir?", casas funerarias con teléfono, cobertura nacional ANDF y "Otras empresas de la red".

### 4.3 Portal de CLIENTES
**A) Primera vez: activación** (con José, `LP-10002`) ⭐ *(escena clave de seguridad)*
1. `/clientes/entrar` → botón dorado **"Activar mi cuenta"**.
2. Paso 1, **"Tus datos"**: Número de contrato `LP-10002`, Teléfono `3127654321` → **"Enviarme un código"**.
3. Paso 2, **"Código"**: "Enviamos un código de 6 dígitos por WhatsApp al teléfono *** *** 4321". El recuadro amarillo de modo demo muestra el código; se escribe y se toca **"Verificar código"**.
4. Paso 3, **"Contraseña"**: "¡Identidad verificada!". Correo (recomendado, p. ej. `jose@ejemplo.com`), contraseña y confirmación (mínimo 8 caracteres con letras y números, p. ej. `Jose2026`) → **"Activar mi cuenta"**.
5. Entra a su inicio con el aviso verde "¡Tu cuenta quedó activada!". Su plan aparece **"Con atraso"**, con el monto pendiente en amarillo.

Mensaje para el video: *"El número de contrato y el teléfono no bastan: se verifica con un código enviado al celular del titular."*

**B) Cliente al corriente** (María, `LP-10001` / `Demo2026`)
1. **Inicio** `/clientes`: "Hola, **María**". Tarjeta del plan **Cobertura Familiar Diamante** con la etiqueta verde **"Al corriente"**, barra de avance (aprox. 42%), **"Te falta por pagar"** (aprox. $4,200) y **"Próximo pago"** ($600 y la fecha). Debajo: "Tus seguros incluidos", "¿Tienes dudas sobre tu plan?" (botón verde **"Hablar con un asesor"**), líneas 24 h y promociones.
2. **Estado de cuenta** (tocar "Ver estado de cuenta" → `/clientes/contratos/LP-10001`): costo del plan $7,200, pagado, lo que falta, abonos restantes, forma de pago (mensual, 12 abonos), próximo y último pago. Botones **"Aclarar un pago"** y **"Ampliar mi protección"** (WhatsApp con el número de contrato), "Qué cubre tu plan", **"Personas protegidas"** (María–Titular, Ricardo–Cónyuge, Sofía–Hija, Mateo–Hijo, Canela–Mascota) e **historial de pagos** con folio y método.
3. **Planes** `/clientes/planes`: el mismo catálogo, sin descuento, con botón "Me interesa".
4. **Promos** `/clientes/promociones`: promociones vigentes para clientes.
5. **Aliados** `/clientes/aliados` ⭐ *(publicidad cruzada)*: tarjetas de empresas afiliadas con su oferta para clientes de La Paz:
   - Grupo Llantero: "10% en alineación y balanceo"
   - Ferretería El Volcán: "5% de descuento en toda la tienda"
   - Clínica Dental Sonrisa: "Limpieza dental con 20% de descuento"
   - Café de Comala: "Café americano de cortesía"
6. **Cuenta** `/clientes/cuenta`: datos personales, correo de recuperación y cambio de contraseña.

**C) Cliente con 2 contratos** (Rosa, `MG-20002` / `Demo2026`): en el inicio aparecen **dos tarjetas**, una **"Liquidado"** ("¡Plan pagado!") y otra en curso.

**D) Recuperar contraseña:** `/clientes/recuperar` → contrato o correo → "Enviar enlace". En modo demo aparece "abrir enlace" → nueva contraseña → entra directo.

### 4.4 ADMINISTRACIÓN (escritorio, `admin@grupolapaz.mx` / `LaPazAdmin2026`)
1. **Panel** `/admin`: 4 indicadores:
   - Clientes (y % con la app activada)
   - Contratos activos (y cuántos con atraso)
   - **Saldo por cobrar**
   - Solicitudes nuevas

   Debajo, la tabla "Últimas solicitudes".
2. **Clientes** `/admin/clientes`: buscador por nombre, contrato, teléfono o correo (no distingue mayúsculas), filtro por casa funeraria, chips de situación (Al corriente / Con atraso / Liquidado), saldo y si la app está "Activa" o "Sin activar". Paginado para miles de registros.
3. **Ficha del cliente** (p. ej. María): editar datos, **"Reiniciar acceso"**, cada contrato con total, pagado, saldo y atraso, **"Registrar pago"** (fecha, monto, método, folio → aviso "Pago registrado." y aparece al instante en el historial), cambio de estatus y beneficiarios.
4. **Nuevo contrato** `/admin/clientes/nuevo`: al elegir plan, variante y frecuencia **los montos se llenan solos** desde el catálogo.
5. **Empresas** `/admin/empresas`: lista con usuario, descuento, solicitudes y último acceso. Al crear o editar una empresa se definen: usuario y contraseña, % de descuento, oferta para clientes, visibilidad en el directorio y si está activa.
6. **Promociones** `/admin/promociones`: crear promoción (título, descripción, audiencia Todos/Clientes/Empresas, imagen, vigencia); pausar o eliminar.
7. **Solicitudes** `/admin/solicitudes` ⭐: aquí aparecen las citas que se pidieron en el video, con el mensaje completo, filtro por estatus (Nueva / Contactada / Cerrada) y botón **"Responder por WhatsApp"**.
8. **Importar** `/admin/importar`: migración de los datos reales en 3 pasos (Contratos → Pagos → Beneficiarios) con plantillas CSV descargables. Se puede repetir sin duplicar y da un reporte de errores por fila.

---

## 5. Catálogo real (por si se mencionan precios)
19 planes:
- **La Paz:** Mónaco ($39,000), **Bosnia** (desde $29,700: inicial $500, $187 semanal, $406 quincenal u $811 mensual), Italia (desde $24,725), Combo Italia + Capilla ($32,000 o $31,925 en Zapotiltic), Tapizado (desde $12,900), Cremación Directa (desde $12,900), Capilla 6/12/24 h (desde $2,350), Nichos de 4 u 8 urnas, Devuélvelo a Casa ($10,700 USD, repatriación desde EE. UU.).
- **Magaña** (35 meses): Zafiro (desde $38,848), Esmeralda, Diamante, Élite (hasta $96,110), Plan Personalizado, Cremación Directa y Capilla.
- **Grupo:** **Cobertura Familiar Diamante** ($7,200 o 12 × $600) y **Platino** ($6,000 o 12 × $500): cubre titular y cónyuge (menores de 64 años), padres (hasta 74) e hijos (hasta 25), más una cremación de mascota al año. **Zoo Descanso** (cremación de mascotas desde $3,220).
- Los planes de previsión incluyen **2 seguros**: por muerte natural del titular (la cuenta queda saldada) y por muerte accidental (queda saldada y se devuelve lo abonado).

Contacto real: atención 24 h **312 313 32 24** y **312 312 45 11** (La Paz), **312 314 51 51** (Magaña). Oficina de previsión 312 314 87 69, de lunes a viernes de 8 a 16 h y sábado de 8 a 12 h. Av. San Fernando No. 200, Centro, Colima.

---

## 6. Guion sugerido (2:30 – 3:00 min)

| # | Escena | Duración | Qué se ve | Voz en off (sugerida) |
|---|---|---|---|---|
| 1 | Apertura | 0:10 | Logo, salas de velación, lema | "En La Paz Grupo Funerario tratamos a tu familia como la nuestra. Hoy llevamos esa cercanía a tu celular." |
| 2 | Portada | 0:08 | Los dos botones | "Una plataforma, dos experiencias: para nuestros clientes y para las empresas aliadas." |
| 3 | Empresa: login e inicio | 0:15 | Login de Grupo Llantero → tarjeta con 15% | "Cuando una empresa se afilia, todos sus colaboradores entran con un solo acceso y ven sus beneficios." |
| 4 | Beneficios | 0:15 | Scroll por los 5 beneficios y la NOM-035 | "Talleres de duelo, cumplimiento de la NOM-035 y 15% de descuento en todos nuestros servicios." |
| 5 | Planes con descuento | 0:15 | Catálogo con precios tachados → detalle de Zafiro | "Cada plan muestra el precio ya con su descuento." |
| 6 | Agendar cita | 0:20 | Formulario, vista previa del mensaje → WhatsApp abierto con el texto | "Agendar es un toque: el mensaje ya dice quién eres y de qué empresa vienes." |
| 7 | Cliente: activación | 0:25 | Contrato + teléfono → código → contraseña → bienvenida | "Nuestros clientes activan su cuenta de forma segura, con un código que llega a su celular." |
| 8 | Cliente: Mi Plan | 0:25 | Inicio de María → estado de cuenta → beneficiarios → historial | "Su plan, lo que llevan pagado, lo que les falta y a quién protegen. Todo visible, siempre." |
| 9 | Aliados | 0:10 | Directorio de aliados con ofertas | "Y descubren beneficios en las empresas de nuestra red." |
| 10 | Admin | 0:25 | Panel → solicitud recién creada → registrar pago | "Nuestro equipo administra todo desde un panel: clientes, pagos, promociones y solicitudes." |
| 11 | Cierre | 0:10 | Líneas 24 h, logo y WhatsApp 312 122 3211 | "La Paz Grupo Funerario. Compromiso con tu paz." |

Sugerencias de edición: transiciones suaves (fundidos), zoom en los detalles clave (sello del 15%, mensaje de WhatsApp, barra de avance de pago), subtítulos en español y sin efectos estridentes.

---

## 7. Para automatizar la grabación (Playwright u otro)
Selectores estables:

| Pantalla | Campos | Botón |
|---|---|---|
| Login de clientes | `#identificador`, `#contrasena` | `button[type=submit]` |
| Activación | `#contrato`, `#telefono` → `#codigo` → `#email`, `#contrasena`, `#confirmar` | — |
| Recuperación | `#identificador` | — |
| Login de empresas | `#usuario`, `#contrasena` | — |
| Agendar | `#nombre`, `#telefono`, `#motivo` (select), `#preferencia` | radios `input[name=modalidad]` |
| Login de admin | `#email`, `#contrasena` | — |

Otros detalles:
- **Código de activación en modo demo:** el texto `form [role=status]` contiene "tu código es NNNNNN". Se puede extraer con la expresión regular `/(\d{6})/`.
- **WhatsApp:** los botones navegan a `https://wa.me/523121223211?text=…`. Para grabar sin salir de la app se puede interceptar esa URL y mostrar el texto decodificado, o grabar en un celular con WhatsApp instalado.
- **Navegación interna:** es del lado del cliente. Al esperar cambios de URL usar `waitUntil: 'commit'`.
- **Viewport sugerido:** clientes y empresas 390×844 con `deviceScaleFactor: 2` e `isMobile: true`; admin 1366×900.
