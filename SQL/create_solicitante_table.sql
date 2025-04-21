CREATE TABLE solicitante (
    identificador VARCHAR(8) PRIMARY KEY,
    tipo_identificador VARCHAR(10) NOT NULL CHECK (tipo_identificador IN ('MR', 'DNI')),
    jerarquia VARCHAR(6) NOT NULL,
    destino VARCHAR(8)NOT NULL,
    telefono VARCHAR(20) NOT NULL
);
