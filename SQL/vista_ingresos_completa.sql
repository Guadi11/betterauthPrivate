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
    r.referido_cc,
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
JOIN registro r ON i.documento = r.documento
JOIN solicitante s ON i.identificador_solicitante = s.identificador;
