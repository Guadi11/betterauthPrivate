CREATE TABLE pases_acceso_transitorio (
    id SERIAL PRIMARY KEY,
    documento_registro VARCHAR(50) NOT NULL,
    identificador_solicitante VARCHAR(8) NOT NULL,
    nro_interno VARCHAR(5) NOT NULL 
        CHECK (length(nro_interno) >= 4 AND length(nro_interno) <= 5 AND nro_interno ~ '^\d+$'),  -- Asegura que solo haya dígitos
    fecha_extension DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    tipo_zona VARCHAR(2) NOT NULL CHECK (tipo_zona IN ('HN', 'ZN', 'ZR', 'PS', 'OT')),
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
