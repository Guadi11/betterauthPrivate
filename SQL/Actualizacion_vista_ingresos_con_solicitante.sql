-- 1. Borramos la vista vieja para evitar el conflicto de columnas
DROP VIEW IF EXISTS public.vista_ingresos_con_solicitante;

-- 2. Creamos la vista de cero con los campos nuevos incluidos
CREATE OR REPLACE VIEW public.vista_ingresos_con_solicitante AS
 SELECT 
    i.id_ingreso,
    i.documento,
    i.nro_tarjeta,
    i.fecha_ingreso,
    i.fecha_egreso,
    i.lugar_visita,
    i.motivo,
    i.observacion,
    -- Nuevos campos agregados:
    i.abierto_por,
    i.abierto_en,
    i.cerrado_por,
    i.cerrado_en,
    i.cierre_fuera_de_tiempo,
    i.motivo_cierre_fuera_de_termino,
    -- Campos de solicitante:
    s.identificador AS identificador_solicitante,
    s.tipo_identificador,
    s.nombre AS nombre_solicitante,
    s.jerarquia,
    s.destino,
    s.telefono
   FROM ingreso_por_dia i
     JOIN solicitante s ON i.identificador_solicitante::text = s.identificador::text;

ALTER TABLE public.vista_ingresos_con_solicitante
    OWNER TO postgres;