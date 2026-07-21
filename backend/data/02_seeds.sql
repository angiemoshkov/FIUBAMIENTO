INSERT INTO spots (latitud, longitud, direccion_aproximada, referencia, fecha_registro) VALUES
(-34.6165645, -58.3695091, 'San Lorenzo 201', 'Esquina con Av. Paseo Colón, vereda de FIUBA', NOW()),
(-34.6177728, -58.369828, 'Dr. Jose Maria Giuffra 221', 'Al lado de la Shell', NOW()),
(-34.6165683, -58.3697058, 'San Lorenzo 230', 'A media cuadra de Paseo Colón', NOW()),
(-34.6185806, -58.3701578, 'Balcarce 914', 'Adelante de Cafe Rivas', NOW()),
(-34.6177018, -58.367353, 'Azopardo 864', 'En frente del grafiti de Evita', NOW()),
(-34.618262, -58.368300, 'Estados Unidos 188', 'Al lado del Ministerio', NOW()),
(-34.6156932,-58.3678308, 'Chile 160', 'En frente al Diario La Prensa', NOW());

INSERT INTO reportes (spot_id, estado_reportado, fecha_creacion, fecha_expiracion, veces_libre, veces_ocupado) VALUES
(1, 'libre', NOW(), NOW() + INTERVAL '3 hours', 1, 0),
(2, 'ocupado', NOW(), NOW() + INTERVAL '3 hours', 0, 1),
(3, 'libre', NOW(), NOW() + INTERVAL '3 hours', 1, 0);

INSERT INTO restricciones (spot_id, tipo, dia_semana, hora_inicio, hora_fin, descripcion) VALUES
-- El spot 1 tiene restricción de carga y descarga temprano por la mañana (Lunes a Viernes)
(1, 'carga_descarga', 1, '06:00:00', '09:00:00', 'Exclusivo carga y descarga de 6 a 9 hs días hábiles.'),
(1, 'carga_descarga', 2, '06:00:00', '09:00:00', 'Exclusivo carga y descarga de 6 a 9 hs días hábiles.'),
(1, 'carga_descarga', 3, '06:00:00', '09:00:00', 'Exclusivo carga y descarga de 6 a 9 hs días hábiles.'),
(3, 'prohibido_estacionar', 1, '07:00:00', '21:00:00', 'Prohibido estacionar días hábiles de 7 a 21 hs (Normativa Avenidas CABA).'),
(3, 'prohibido_estacionar', 2, '07:00:00', '21:00:00', 'Prohibido estacionar días hábiles de 7 a 21 hs (Normativa Avenidas CABA).'),
(3, 'prohibido_estacionar', 5, '07:00:00', '21:00:00', 'Prohibido estacionar días hábiles de 7 a 21 hs (Normativa Avenidas CABA).'),
(4, 'prohibido_estacionar', 6, '07:00:00', '23:59:59', 'Prohibido estacionar los sabados de 7 a 23:59 hs.');
