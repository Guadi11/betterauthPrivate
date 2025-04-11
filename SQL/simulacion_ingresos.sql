-- Simulaciones para 44321331 (DNI)
INSERT INTO ingreso_por_dia (documento, nro_tarjeta, fecha_ingreso, fecha_egreso, lugar_visita, motivo)
VALUES 
('44321331', 'TARJETA01', '2025-04-09 08:30:00', '2025-04-09 15:10:00', 'Edificio Central', 'Reunión con recursos humanos'),
('44321331', 'TARJETA02', '2025-04-10 09:45:00', NULL, 'Oficina de Sistemas', 'Auditoría de sistemas');

-- Simulaciones para IJ678901 (Pasaporte)
INSERT INTO ingreso_por_dia (documento, nro_tarjeta, fecha_ingreso, fecha_egreso, lugar_visita, motivo)
VALUES 
('IJ678901', 'PASS6789', '2025-04-08 10:00:00', '2025-04-08 18:00:00', 'Sala de reuniones B', 'Negociación de contrato'),
('IJ678901', 'PASS6790', '2025-04-11 07:55:00', NULL, 'Área Técnica', 'Supervisión de equipos');
