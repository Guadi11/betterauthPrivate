-- =====================================================================
-- Proyecto: Control de Entradas – Esquema base corregido
-- Cambios clave:
--  - Orden correcto de creación (solicitante -> registro -> ingreso_por_dia -> vistas)
--  - Tipos alineados para FKs (documento VARCHAR(20) en ambas tablas)
--  - Eliminación de ; erróneo y casts innecesarios en vistas
--  - CHECK de rango y orden cronológico en fechas de ingreso/egreso
--  - Índice único parcial para integridad de tarjetas con egreso abierto
--  - Reglas de formato de identificador según tipo (MR=7 dígitos, DNI=8 dígitos)
--  - Se elimina índice redundante sobre PK de registro
--  - Índices útiles para consultas/reportes
-- =====================================================================

-- Limpieza opcional (usar con cuidado si hay datos):
-- DROP VIEW IF EXISTS vista_ingresos_con_solicitante;
-- DROP VIEW IF EXISTS vista_ingresos_completa;
-- DROP TABLE IF EXISTS ingreso_por_dia;
-- DROP TABLE IF EXISTS registro;
-- DROP TABLE IF EXISTS solicitante;

-- =========================
-- 1) SOLICITANTE
-- =========================
CREATE TABLE solicitante (
    identificador        VARCHAR(8) PRIMARY KEY,
    tipo_identificador   VARCHAR(3) NOT NULL CHECK (tipo_identificador IN ('MR', 'DNI')),
    jerarquia            VARCHAR(6) NOT NULL,
    destino              VARCHAR(8) NOT NULL, 
    telefono             VARCHAR(20) NOT NULL,
    nombre               VARCHAR(100) NOT NULL,
    CONSTRAINT chk_identificador_formato
      CHECK (
        (tipo_identificador = 'MR'  AND identificador ~ '^\d{7}$') OR
        (tipo_identificador = 'DNI' AND identificador ~ '^\d{8}$')
      )
);

-- =========================
-- 2) REGISTRO
-- =========================
-- Alineamos el largo del documento al máximo real requerido (Pasaporte hasta 20),
-- así ingresopor_dia.documento puede referenciarlo con el mismo tipo/largo.
-- Table: public.registro

-- DROP TABLE IF EXISTS public.registro;

CREATE TABLE IF NOT EXISTS public.registro
(
    documento character varying(50) COLLATE pg_catalog."default" NOT NULL,
    tipo_documento character varying(20) COLLATE pg_catalog."default" NOT NULL,
    nombre character varying(100) COLLATE pg_catalog."default" NOT NULL,
    apellido character varying(100) COLLATE pg_catalog."default" NOT NULL,
    fecha_nacimiento date,
    nacionalidad character varying(100) COLLATE pg_catalog."default",
    domicilio_real character varying(255) COLLATE pg_catalog."default",
    domicilio_eventual character varying(255) COLLATE pg_catalog."default",
    observacion_cc boolean DEFAULT false,
    observacion text COLLATE pg_catalog."default",
    creado_en timestamp with time zone DEFAULT now(),
    actualizado_en timestamp with time zone DEFAULT now(),
    CONSTRAINT registro_pkey PRIMARY KEY (documento),
    CONSTRAINT check_documento CHECK (tipo_documento::text = 'DNI'::text AND documento::text ~ '^\d{7,8}$'::text OR tipo_documento::text = 'Pasaporte'::text AND documento::text ~ '^[A-Za-z0-9]{6,20}$'::text),
    CONSTRAINT registro_tipo_documento_check CHECK (tipo_documento::text = ANY (ARRAY['DNI'::character varying, 'Pasaporte'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.registro
    OWNER to postgres;
-- Index: idx_registro_documento

-- DROP INDEX IF EXISTS public.idx_registro_documento;

CREATE INDEX IF NOT EXISTS idx_registro_documento
    ON public.registro USING btree
    (documento COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;

-- Trigger: set_actualizado_en

-- DROP TRIGGER IF EXISTS set_actualizado_en ON public.registro;

CREATE OR REPLACE FUNCTION trigger_set_actualizado_en_registro()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_actualizado_en
BEFORE UPDATE ON public.registro
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_actualizado_en_registro();

-- NOTA: No creamos índice adicional sobre documento porque ya es PK (índice implícito).

-- =========================
-- 3) INGRESO POR DÍA
-- =========================
CREATE TABLE ingreso_por_dia (
    id_ingreso                 SERIAL PRIMARY KEY,
    documento                  VARCHAR(20) NOT NULL,
    nro_tarjeta                VARCHAR(10) NOT NULL,
    fecha_ingreso              TIMESTAMP NOT NULL,
    fecha_egreso               TIMESTAMP,
    lugar_visita               VARCHAR(100) NOT NULL,
    motivo                     TEXT NOT NULL,
    observacion                TEXT,
    identificador_solicitante  VARCHAR(8) NOT NULL,

    CONSTRAINT fk_documento
      FOREIGN KEY (documento) 
      REFERENCES registro(documento),

    CONSTRAINT fk_solicitante
      FOREIGN KEY (identificador_solicitante) 
      REFERENCES solicitante(identificador),

    -- Egreso válido: nulo (aún dentro) o >= ingreso y no más de 24 horas
    CONSTRAINT chk_duracion_visita
      CHECK (
        fecha_egreso IS NULL OR
        (fecha_egreso >= fecha_ingreso AND fecha_egreso <= fecha_ingreso + INTERVAL '24 hours')
      )
);

-- =========================
-- 4) ÍNDICES PARA INTEGRIDAD Y RENDIMIENTO
-- =========================

-- Integridad de tarjetas: una tarjeta no puede estar "abierta" en dos ingresos simultáneos.
CREATE UNIQUE INDEX ux_tarjeta_abierta
  ON ingreso_por_dia (nro_tarjeta)
  WHERE fecha_egreso IS NULL;

-- (Opcional) Integridad por persona: un mismo documento no debería tener dos ingresos abiertos a la vez.
-- CREATE UNIQUE INDEX ux_documento_abierto
--   ON ingreso_por_dia (documento)
--   WHERE fecha_egreso IS NULL;

-- Búsquedas frecuentes:
CREATE INDEX idx_ingreso_documento    ON ingreso_por_dia(documento);
CREATE INDEX idx_ingreso_solicitante  ON ingreso_por_dia(identificador_solicitante);
CREATE INDEX idx_ingreso_fecha        ON ingreso_por_dia(fecha_ingreso DESC);

-- =========================
-- 5) VISTAS
-- =========================

CREATE VIEW vista_ingresos_completa AS
SELECT
    i.id_ingreso,
    i.documento,
    r.tipo_documento,
    r.nombre,
    r.apellido,
    r.fecha_nacimiento,
    r.nacionalidad,
    r.domicilio_real,
    r.domicilio_eventual,
    r.observacion_cc,
    i.nro_tarjeta,
    i.fecha_ingreso,
    i.fecha_egreso,
    i.lugar_visita,
    i.motivo,
    i.observacion,
    s.identificador AS identificador_solicitante,
    s.tipo_identificador,
    s.nombre AS nombre_solicitante,
    s.jerarquia,
    s.destino,
    s.telefono
FROM ingreso_por_dia i
JOIN registro    r ON i.documento = r.documento
JOIN solicitante s ON i.identificador_solicitante = s.identificador;

CREATE VIEW vista_ingresos_con_solicitante AS
SELECT
    i.id_ingreso,
    i.documento,
    i.nro_tarjeta,
    i.fecha_ingreso,
    i.fecha_egreso,
    i.lugar_visita,
    i.motivo,
    i.observacion,
    s.identificador AS identificador_solicitante,
    s.tipo_identificador,
    s.nombre AS nombre_solicitante,
    s.jerarquia,
    s.destino,
    s.telefono
FROM ingreso_por_dia i
JOIN solicitante s ON i.identificador_solicitante = s.identificador;

CREATE TABLE pases_acceso_transitorio (
    id SERIAL PRIMARY KEY,
    documento_registro VARCHAR(50) NOT NULL,
    identificador_solicitante VARCHAR(8) NOT NULL,
    nro_interno VARCHAR(5) NOT NULL 
        CHECK (length(nro_interno) >= 4 AND length(nro_interno) <= 5 AND nro_interno ~ '^\d+$'),  -- Asegura que solo haya dígitos
    fecha_extension DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    tipo_zona VARCHAR(2) NOT NULL CHECK (tipo_zona IN ('HN', 'ZC', 'ZR', 'PS', 'OT')),
    acceso_pat VARCHAR(100) NOT NULL,
    causa_motivo_pat TEXT NOT NULL,
    codigo_de_seguridad VARCHAR(100) NOT NULL,
    CONSTRAINT fk_documento_registro FOREIGN KEY (documento_registro) REFERENCES registro(documento),
    CONSTRAINT fk_identificador_solicitante FOREIGN KEY (identificador_solicitante) REFERENCES solicitante(identificador)
);

-- Crear índice en documento_registro para mejorar la consulta por documento
CREATE INDEX idx_pase_acceso_documento ON pases_acceso_transitorio(documento_registro);
-- Índice para acelerar las consultas por identificador_solicitante
CREATE INDEX idx_pase_acceso_solicitante ON pases_acceso_transitorio(identificador_solicitante);

-- =========================================================
-- A) Tabla: diseno_pat
-- =========================================================
CREATE TABLE IF NOT EXISTS diseno_pat (
  id                  BIGSERIAL PRIMARY KEY,
  nombre              TEXT NOT NULL UNIQUE,
  ancho_mm            NUMERIC(6,2) NOT NULL CHECK (ancho_mm > 0),
  alto_mm             NUMERIC(6,2) NOT NULL CHECK (alto_mm > 0),
  dpi_previsualizacion INTEGER NOT NULL DEFAULT 300 CHECK (dpi_previsualizacion > 0),
  lienzo_json         JSONB NOT NULL,
  estado              TEXT NOT NULL DEFAULT 'borrador'
                      CHECK (estado IN ('borrador','publicado','archivado')),
  creado_por          TEXT NOT NULL,
  actualizado_por     TEXT,
  creado_en           TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Listados rápidos por estado / fechas
CREATE INDEX IF NOT EXISTS ix_diseno_pat_estado ON diseno_pat(estado);
CREATE INDEX IF NOT EXISTS ix_diseno_pat_creado_en ON diseno_pat(creado_en);
CREATE INDEX IF NOT EXISTS ix_diseno_pat_actualizado_en ON diseno_pat(actualizado_en);

-- Opcional: si querés validar forma básica del JSON en SQL, podés agregar constraints con jsonschema via trigger (no incluido aquí).

-- Trigger opcional para actualizado_en
CREATE OR REPLACE FUNCTION set_actualizado_en_diseno_pat()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_actualizado_en_diseno_pat ON diseno_pat;
CREATE TRIGGER trg_set_actualizado_en_diseno_pat
BEFORE UPDATE ON diseno_pat
FOR EACH ROW EXECUTE FUNCTION set_actualizado_en_diseno_pat();

-- =========================================================
-- B) Tabla: recurso_diseno_pat (assets/sellos por diseño)
-- =========================================================
CREATE TABLE IF NOT EXISTS recurso_diseno_pat (
  id          BIGSERIAL PRIMARY KEY,
  diseno_id   BIGINT NOT NULL REFERENCES diseno_pat(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  mime_type   TEXT NOT NULL,
  datos       BYTEA NOT NULL,  -- almacenado offline
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_recurso_diseno_pat_diseno_id ON recurso_diseno_pat(diseno_id);
-- Si querés evitar duplicados binarios: agregar un hash opcional
-- ALTER TABLE recurso_diseno_pat ADD COLUMN hash_sha256 TEXT;
-- CREATE UNIQUE INDEX IF NOT EXISTS ux_recurso_hash_por_diseno ON recurso_diseno_pat(diseno_id, hash_sha256);

-- =========================================================
-- C) Tabla: log_impresion_pat (auditoría)
-- =========================================================
CREATE TABLE IF NOT EXISTS log_impresion_pat (
  id                  BIGSERIAL PRIMARY KEY,
  pat_id              BIGINT NOT NULL REFERENCES pases_acceso_transitorio(id),
  diseno_id           BIGINT NOT NULL REFERENCES diseno_pat(id),
  impreso_por         TEXT NOT NULL,
  impreso_en          TIMESTAMPTZ NOT NULL DEFAULT now(),
  copias              INTEGER NOT NULL DEFAULT 1 CHECK (copias > 0),
  variables_resueltas JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_log_impresion_pat_pat_id ON log_impresion_pat(pat_id);
CREATE INDEX IF NOT EXISTS ix_log_impresion_pat_diseno_id ON log_impresion_pat(diseno_id);
CREATE INDEX IF NOT EXISTS ix_log_impresion_pat_impreso_en ON log_impresion_pat(impreso_en);
-- Para consultas por campo dentro de variables_resueltas:
CREATE INDEX IF NOT EXISTS ix_log_impresion_pat_vars_gin ON log_impresion_pat USING GIN (variables_resueltas);
