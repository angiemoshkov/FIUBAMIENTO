INSERT INTO spots (latitud, longitud, direccion_aproximada, estado_actual) VALUES
(-34.617565, -58.368310, 'Av. Paseo Colón 820 (Frente a FIUBA)', 'libre'),
(-34.617120, -58.367850, 'Estados Unidos 400 (A la vuelta)', 'ocupado'),
(-34.618100, -58.369100, 'Av. Independencia 500 (Esquina)', 'restringido');

INSERT INTO reportes (spot_id, estado_reportado, fecha_creacion, fecha_expiracion, confianza_positiva, confianza_negativa) VALUES
-- Reporte para el Spot 1 (Alguien vio que se liberó hace un ratito, expira en 20 min)
(1, 'libre', NOW() - INTERVAL '5 minutes', NOW() + INTERVAL '15 minutes', 3, 0),

-- Reporte para el Spot 2 (Alguien reportó ocupado, y otro usuario lo confirmó)
(2, 'ocupado', NOW() - INTERVAL '10 minutes', NOW() + INTERVAL '10 minutes', 2, 0),

-- Reporte para el Spot 3 (Alguien se está yendo ahora mismo)
(3, 'me_yendo', NOW(), NOW() + INTERVAL '20 minutes', 1, 0);

INSERT INTO restricciones (spot_id, tipo_restriccion, dia_semana, hora_inicio, hora_fin, descripcion) VALUES
-- El spot 1 tiene restricción de carga y descarga temprano por la mañana (Lunes a Viernes)
(1, 'carga_descarga', 1, '06:00:00', '09:00:00', 'Exclusivo carga y descarga de 6 a 9 hs días hábiles.'),
(1, 'carga_descarga', 2, '06:00:00', '09:00:00', 'Exclusivo carga y descarga de 6 a 9 hs días hábiles.'),
(1, 'carga_descarga', 3, '06:00:00', '09:00:00', 'Exclusivo carga y descarga de 6 a 9 hs días hábiles.'),

-- El spot 3 está sobre una avenida (Independencia), prohibido estacionar días hábiles de 7 a 21 hs
(3, 'prohibido_estacionar', 1, '07:00:00', '21:00:00', 'Prohibido estacionar días hábiles de 7 a 21 hs (Normativa Avenidas CABA).'),
(3, 'prohibido_estacionar', 2, '07:00:00', '21:00:00', 'Prohibido estacionar días hábiles de 7 a 21 hs (Normativa Avenidas CABA).'),
(3, 'prohibido_estacionar', 3, '07:00:00', '21:00:00', 'Prohibido estacionar días hábiles de 7 a 21 hs (Normativa Avenidas CABA).'),
(3, 'prohibido_estacionar', 4, '07:00:00', '21:00:00', 'Prohibido estacionar días hábiles de 7 a 21 hs (Normativa Avenidas CABA).'),
(3, 'prohibido_estacionar', 5, '07:00:00', '21:00:00', 'Prohibido estacionar días hábiles de 7 a 21 hs (Normativa Avenidas CABA).');
