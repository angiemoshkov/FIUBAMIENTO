const { Pool } = require('pg');
require('dotenv').config();

// Se inicializa el pool directamente aquí para no depender de otros archivos
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const reportesQueries = {
  getAll: async () => {
    const res = await pool.query('SELECT * FROM reportes ORDER BY fecha_creacion DESC');
    return res.rows;
  },

  create: async ({ spot_id, estado_reportado, fecha_expiracion, confianza_positiva, confianza_negativa }) => {
    const query = `
      INSERT INTO reportes (spot_id, estado_reportado, fecha_expiracion, confianza_positiva, confianza_negativa)
      VALUES ($1, $2, $3, COALESCE($4, 1), COALESCE($5, 0))
      RETURNING *;
    `;
    const valores = [spot_id, estado_reportado, fecha_expiracion, confianza_positiva, confianza_negativa];
    const res = await pool.query(query, valores);
    return res.rows[0];
  },

  update: async (id, { spot_id, estado_reportado, fecha_expiracion, confianza_positiva, confianza_negativa }) => {
    const query = `
      UPDATE reportes 
      SET spot_id = $1, estado_reportado = $2, fecha_expiracion = $3, confianza_positiva = $4, confianza_negativa = $5
      WHERE id = $6
      RETURNING *;
    `;
    const valores = [spot_id, estado_reportado, fecha_expiracion, confianza_positiva, confianza_negativa, id];
    const res = await pool.query(query, valores);
    return res.rows[0];
  },

  delete: async (id) => {
    const res = await pool.query('DELETE FROM reportes WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
  }
};

module.exports = reportesQueries;