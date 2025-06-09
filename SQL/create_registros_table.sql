CREATE TABLE registro (
    documento VARCHAR(50) PRIMARY KEY,
    tipo_documento VARCHAR(20) NOT NULL CHECK (tipo_documento IN ('DNI', 'Pasaporte')),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    nacionalidad VARCHAR(100),
    domicilio_real VARCHAR(255),
    domicilio_eventual VARCHAR(255),
    observacion_cc BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT check_documento 
        CHECK (
            (tipo_documento = 'DNI' AND documento ~ '^\d{7,8}$') OR 
            (tipo_documento = 'Pasaporte' AND length(documento) BETWEEN 6 AND 20)
        )
);

-- Índice para búsquedas rápidas por documento
CREATE INDEX idx_registro_documento ON registro(documento);