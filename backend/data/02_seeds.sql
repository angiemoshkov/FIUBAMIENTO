INSERT INTO spots (latitud, longitud, direccion_aproximada, estado_actual) VALUES
(-34.6165645, -58.3695091, 'Calle San Lorenzo', 'libre'),
(-34.6165652, -58.3695429, 'Calle San Lorenzo', 'ocupado'),
(-34.6165662, -58.3695712, 'Calle San Lorenzo', 'libre'),
(-34.6165683, -58.3695994, 'Calle San Lorenzo', 'ocupado'),
(-34.6165683, -58.3696276, 'Calle San Lorenzo', 'libre'),
(-34.6165694, -58.3696507, 'Calle San Lorenzo', 'libre'),
(-34.6165683, -58.3696751, 'Calle San Lorenzo', 'ocupado'),
(-34.6165683, -58.3697058, 'Calle San Lorenzo', 'libre'),
(-34.6165705, -58.3697353, 'Calle San Lorenzo', 'ocupado'),
(-34.6165726, -58.3697674, 'Calle San Lorenzo', 'libre'), 
(-34.6165736, -58.3697918, 'Calle San Lorenzo', 'libre'),
(-34.6165726, -58.3698200, 'Calle San Lorenzo', 'ocupado'),
(-34.6165726, -58.3698546, 'Calle San Lorenzo', 'libre'),
(-34.6165747, -58.3698854, 'Calle San Lorenzo', 'libre'),
(-34.6165768, -58.3699136, 'Calle San Lorenzo', 'ocupado'),
(-34.6165768, -58.3699508, 'Calle San Lorenzo', 'libre'),
(-34.6165800, -58.3699790, 'Calle San Lorenzo', 'libre'),
(-34.6165821, -58.3700085, 'Calle San Lorenzo', 'ocupado'),
(-34.6165800, -58.3700406, 'Calle San Lorenzo', 'ocupado'),
(-34.6165831, -58.3700727, 'Calle San Lorenzo', 'libre');

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
