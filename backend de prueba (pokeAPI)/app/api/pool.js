import pkg from "pg"
const { Pool } = pkg
 
export const pool = new Pool({
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "post",
  host: process.env.DB_HOST, //uso variables de entorno para conectarme al puerto del contenedor
  port: process.env.DB_PORT ?? 5432,
  database: process.env.DB_NAME,
})

//pongo valores por default para evitar ponerlo cuando no lo necesito