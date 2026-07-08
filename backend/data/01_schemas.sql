CREATE TABLE spots (
    id SERIAL PRIMARY KEY,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    direccion_aproximada VARCHAR(100) NOT NULL,
    referencia VARCHAR (150) NOT NULL,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reportes (
    id SERIAL PRIMARY KEY,
    spot_id INT REFERENCES spots(id),
    estado_reportado VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMPTZ NOT NULL,
    veces_libre INT NOT NULL DEFAULT 0,
    veces_ocupado INT NOT NULL DEFAULT 0
);

CREATE TABLE restricciones (
    id SERIAL PRIMARY KEY,
    spot_id INT REFERENCES spots(id),
    tipo VARCHAR(100) NOT NULL,
    dia_semana INT NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    descripcion TEXT
);
