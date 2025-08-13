-- =====================================================================
-- Migration: Enforce single open ingreso per documento (and tarjeta)
-- Date: 2025-08-13
-- Notes:
--  - This script is SAFE for production usage patterns: it uses CONCURRENTLY for indexes.
--  - DO NOT run inside a BEGIN/COMMIT transaction block.
--  - If duplicates exist, the UNIQUE INDEX creation will fail; resolve duplicates first.
-- =====================================================================

-- 0) (Optional) Normalize tarjetas to uppercase & trimmed to match the CHECK and avoid dup keys by case/space
UPDATE ingreso_por_dia
SET nro_tarjeta = UPPER(BTRIM(nro_tarjeta))
WHERE nro_tarjeta <> UPPER(BTRIM(nro_tarjeta));

-- 1) PRECHECKS: Detect duplicates that would block the unique indexes.

-- 1.a) Tarjetas con más de un ingreso ABIERTO (fecha_egreso IS NULL)
--     Si hay filas, revisarlas y cerrar la que no corresponda.
--     Ejemplo de decisión: mantener la más reciente y cerrar las previas.
SELECT
  nro_tarjeta,
  COUNT(*) AS abiertos,
  ARRAY_AGG(id_ingreso ORDER BY fecha_ingreso) AS ids_abiertos
FROM ingreso_por_dia
WHERE fecha_egreso IS NULL
GROUP BY nro_tarjeta
HAVING COUNT(*) > 1;

-- 1.b) Documentos con más de un ingreso ABIERTO
SELECT
  documento,
  COUNT(*) AS abiertos,
  ARRAY_AGG(id_ingreso ORDER BY fecha_ingreso) AS ids_abiertos
FROM ingreso_por_dia
WHERE fecha_egreso IS NULL
GROUP BY documento
HAVING COUNT(*) > 1;

-- 2) Crear/asegurar el índice único parcial por TARJETA (si no existe).
--    Evita dos ingresos abiertos con la misma tarjeta.
--    Nota: CONCURRENTLY no puede ejecutarse dentro de una transacción.
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS ux_tarjeta_abierta
  ON ingreso_por_dia (nro_tarjeta)
  WHERE fecha_egreso IS NULL;

-- 3) Crear el índice único parcial por DOCUMENTO (NUEVO).
--    Evita dos ingresos abiertos para la misma persona/documento.
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS ux_documento_abierto
  ON ingreso_por_dia (documento)
  WHERE fecha_egreso IS NULL;

-- 4) (Opcional) Verificación post-migración: estos SELECT deben devolver 0 filas.
-- SELECT 1
-- FROM ingreso_por_dia
-- WHERE fecha_egreso IS NULL
-- GROUP BY documento
-- HAVING COUNT(*) > 1;
--
-- SELECT 1
-- FROM ingreso_por_dia
-- WHERE fecha_egreso IS NULL
-- GROUP BY nro_tarjeta
-- HAVING COUNT(*) > 1;
