-- CreateTable
CREATE TABLE "Funeraria" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "logoUrl" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Funeraria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "funerariaId" TEXT,
    "subtitulo" TEXT,
    "resumen" TEXT NOT NULL,
    "precioCentavos" INTEGER NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "incluye" TEXT NOT NULL DEFAULT '[]',
    "beneficios" TEXT NOT NULL DEFAULT '[]',
    "cremacion" TEXT NOT NULL DEFAULT '[]',
    "variantes" TEXT NOT NULL DEFAULT '[]',
    "plazos" TEXT NOT NULL DEFAULT '{}',
    "aplicaPara" TEXT,
    "notas" TEXT,
    "imagenUrl" TEXT,
    "fichaUrl" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT,
    "activadoEn" TIMESTAMP(3),
    "ultimoAcceso" TIMESTAMP(3),
    "claveExterna" TEXT,
    "funerariaId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "funerariaId" TEXT NOT NULL,
    "fechaContratacion" TIMESTAMP(3) NOT NULL,
    "montoTotalCentavos" INTEGER NOT NULL,
    "pagoInicialCentavos" INTEGER NOT NULL DEFAULT 0,
    "frecuencia" TEXT NOT NULL,
    "abonoCentavos" INTEGER NOT NULL DEFAULT 0,
    "numeroAbonos" INTEGER NOT NULL DEFAULT 0,
    "estatus" TEXT NOT NULL DEFAULT 'ACTIVO',
    "notas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficiario" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),

    CONSTRAINT "Beneficiario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "contratoId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "montoCentavos" INTEGER NOT NULL,
    "metodo" TEXT NOT NULL DEFAULT 'EFECTIVO',
    "folio" TEXT,
    "registradoPor" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "giro" TEXT,
    "descripcion" TEXT,
    "logoUrl" TEXT,
    "telefono" TEXT,
    "whatsapp" TEXT,
    "sitioWeb" TEXT,
    "direccion" TEXT,
    "descuentoEmpleados" INTEGER NOT NULL DEFAULT 15,
    "ofertaClientes" TEXT,
    "visibleDirectorio" BOOLEAN NOT NULL DEFAULT true,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "convenioDesde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimoAcceso" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promocion" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "imagenUrl" TEXT,
    "audiencia" TEXT NOT NULL DEFAULT 'TODOS',
    "vigenteDesde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigenteHasta" TIMESTAMP(3),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promocion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solicitud" (
    "id" TEXT NOT NULL,
    "origen" TEXT NOT NULL,
    "empresaId" TEXT,
    "clienteId" TEXT,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "motivo" TEXT NOT NULL,
    "modalidad" TEXT,
    "preferencia" TEXT,
    "mensaje" TEXT NOT NULL,
    "estatus" TEXT NOT NULL DEFAULT 'NUEVA',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodigoVerificacion" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "usadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodigoVerificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'ADMIN',
    "ultimoAcceso" TIMESTAMP(3),

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntentoAcceso" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "exito" BOOLEAN NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntentoAcceso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Funeraria_slug_key" ON "Funeraria"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_codigo_key" ON "Plan"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_claveExterna_key" ON "Cliente"("claveExterna");

-- CreateIndex
CREATE INDEX "Cliente_telefono_idx" ON "Cliente"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "Contrato_numero_key" ON "Contrato"("numero");

-- CreateIndex
CREATE INDEX "Contrato_clienteId_idx" ON "Contrato"("clienteId");

-- CreateIndex
CREATE INDEX "Pago_contratoId_fecha_idx" ON "Pago"("contratoId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_contratoId_folio_key" ON "Pago"("contratoId", "folio");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_slug_key" ON "Empresa"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_usuario_key" ON "Empresa"("usuario");

-- CreateIndex
CREATE INDEX "Solicitud_creadoEn_idx" ON "Solicitud"("creadoEn");

-- CreateIndex
CREATE UNIQUE INDEX "CodigoVerificacion_hash_key" ON "CodigoVerificacion"("hash");

-- CreateIndex
CREATE INDEX "CodigoVerificacion_clienteId_tipo_idx" ON "CodigoVerificacion"("clienteId", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "IntentoAcceso_clave_creadoEn_idx" ON "IntentoAcceso"("clave", "creadoEn");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_funerariaId_fkey" FOREIGN KEY ("funerariaId") REFERENCES "Funeraria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_funerariaId_fkey" FOREIGN KEY ("funerariaId") REFERENCES "Funeraria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_funerariaId_fkey" FOREIGN KEY ("funerariaId") REFERENCES "Funeraria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiario" ADD CONSTRAINT "Beneficiario_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "Contrato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodigoVerificacion" ADD CONSTRAINT "CodigoVerificacion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
