-- Recursos globales por instalación (no multi-tenant)
CREATE TABLE IF NOT EXISTS recurso (
id BIGSERIAL PRIMARY KEY,
nombre TEXT NOT NULL,
mime_type TEXT NOT NULL CHECK (mime_type IN ('image/png','image/jpeg')),
sha256 CHAR(64) NOT NULL UNIQUE,
bytes_size INTEGER NOT NULL CHECK (bytes_size > 0),
ancho_px INTEGER NOT NULL CHECK (ancho_px > 0),
alto_px INTEGER NOT NULL CHECK (alto_px > 0),
datos BYTEA NOT NULL,
thumb_datos BYTEA,
estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado = ANY (ARRAY['activo','archivado']::TEXT[])),
creado_por TEXT NOT NULL DEFAULT 'system',
creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Relación N a N entre recursos y diseños (para contar usos y aplicar reglas de borrado)
CREATE TABLE IF NOT EXISTS recurso_en_diseno (
diseno_id BIGINT NOT NULL REFERENCES diseno_pat(id) ON DELETE CASCADE,
recurso_id BIGINT NOT NULL REFERENCES recurso(id) ON DELETE RESTRICT,
PRIMARY KEY (diseno_id, recurso_id)
);


-- Acelera conteos por recurso
CREATE INDEX IF NOT EXISTS idx_recurso_en_diseno_recurso ON recurso_en_diseno(recurso_id);


-- (Opcional) Vistas cómodas
CREATE OR REPLACE VIEW recurso_con_usos AS
SELECT r.*, COALESCE(u.usos, 0) AS usos
FROM recurso r
LEFT JOIN (
SELECT recurso_id, COUNT(*)::INT AS usos
FROM recurso_en_diseno
GROUP BY recurso_id
) u ON u.recurso_id = r.id;