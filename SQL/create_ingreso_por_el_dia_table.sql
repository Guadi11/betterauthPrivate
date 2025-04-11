CREATE TABLE ingreso_por_dia (
    id_ingreso SERIAL PRIMARY KEY,
    documento VARCHAR(20) NOT NULL,
    nro_tarjeta VARCHAR(10) NOT NULL,
    fecha_ingreso TIMESTAMP NOT NULL,
    fecha_egreso TIMESTAMP,
    lugar_visita VARCHAR(100) NOT NULL,
    motivo TEXT NOT NULL,
    CONSTRAINT fk_documento FOREIGN KEY (documento) REFERENCES registro(documento),
    CONSTRAINT chk_max_duracion_visita CHECK (
        fecha_egreso IS NULL OR 
        fecha_egreso <= fecha_ingreso + INTERVAL '24 hours'
    )
);
