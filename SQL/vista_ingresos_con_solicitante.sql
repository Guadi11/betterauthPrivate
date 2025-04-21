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
    s.jerarquia,
    s.destino,
    s.telefono
FROM ingreso_por_dia i
JOIN solicitante s ON i.identificador_solicitante = s.identificador;
