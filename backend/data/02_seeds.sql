INSERT INTO spots (latitud, longitud, direccion_aproximada, referencia, fecha_registro) VALUES
(-34.6165645, -58.3695091, 'Calle San Lorenzo', 'Esquina con Av. Paseo Colón, vereda de FIUBA', NOW()),
(-34.6165652, -58.3695429, 'Calle San Lorenzo', 'Sobre San Lorenzo, a metros de Paseo Colón', NOW()),
(-34.6165662, -58.3695712, 'Calle San Lorenzo', 'Frente al acceso principal de FIUBA', NOW()),
(-34.6165683, -58.3695994, 'Calle San Lorenzo', 'Frente a FIUBA, junto a la parada de colectivo', NOW()),
(-34.6165683, -58.3696276, 'Calle San Lorenzo', 'Sobre San Lorenzo, a la altura del patio de FIUBA', NOW()),
(-34.6165694, -58.3696507, 'Calle San Lorenzo', 'Mitad de cuadra entre Paseo Colón y Balcarce', NOW()),
(-34.6165683, -58.3696751, 'Calle San Lorenzo', 'Sobre San Lorenzo, frente a comercio de la vereda impar', NOW()),
(-34.6165683, -58.3697058, 'Calle San Lorenzo', 'A media cuadra de Paseo Colón', NOW()),
(-34.6165705, -58.3697353, 'Calle San Lorenzo', 'Sobre San Lorenzo, frente a edificio de departamentos', NOW()),
(-34.6165726, -58.3697674, 'Calle San Lorenzo', 'Centro de cuadra, San Lorenzo entre Paseo Colón y Balcarce', NOW()),
(-34.6165736, -58.3697918, 'Calle San Lorenzo', 'Sobre San Lorenzo, cerca de la boca de tormenta', NOW()),
(-34.6165726, -58.3698200, 'Calle San Lorenzo', 'Sobre San Lorenzo, frente a portón de cochera', NOW()),
(-34.6165726, -58.3698546, 'Calle San Lorenzo', 'Sobre San Lorenzo, tramo hacia Balcarce', NOW()),
(-34.6165747, -58.3698854, 'Calle San Lorenzo', 'Sobre San Lorenzo, frente a kiosco', NOW()),
(-34.6165768, -58.3699136, 'Calle San Lorenzo', 'Sobre San Lorenzo, a un cuarto de cuadra de Balcarce', NOW()),
(-34.6165768, -58.3699508, 'Calle San Lorenzo', 'Sobre San Lorenzo, frente a entrada de garage', NOW()),
(-34.6165800, -58.3699790, 'Calle San Lorenzo', 'Sobre San Lorenzo, cerca del árbol de la vereda', NOW()),
(-34.6165821, -58.3700085, 'Calle San Lorenzo', 'Sobre San Lorenzo, a metros de la esquina de Balcarce', NOW()),
(-34.6165800, -58.3700406, 'Calle San Lorenzo', 'Sobre San Lorenzo, junto a la esquina de Balcarce', NOW()),
(-34.6165831, -58.3700727, 'Calle San Lorenzo', 'Esquina con Balcarce', NOW());

INSERT INTO reportes (spot_id, estado_reportado, fecha_creacion, fecha_expiracion, confianza_positiva, confianza_negativa) VALUES
-- Reporte para el Spot 1 (Alguien vio que se liberó hace un ratito, expira en 20 min)
(1, 'libre', NOW() - INTERVAL '5 minutes', NOW() + INTERVAL '15 minutes', 3, 0),

-- Reporte para el Spot 2 (Alguien reportó ocupado, y otro usuario lo confirmó)
(2, 'ocupado', NOW() - INTERVAL '10 minutes', NOW() + INTERVAL '10 minutes', 2, 0),

-- Reporte para el Spot 3 (reportado como libre por un usuario)
(3, 'libre', NOW(), NOW() + INTERVAL '20 minutes', 1, 0); --me_yendo no tenia sentido, ya que se libera cuando se va, quedando como libre

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
