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
