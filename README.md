# 🅿️ FIUBAMIENTO

Plataforma web colaborativa para visualizar en tiempo casi real la disponibilidad de lugares de estacionamiento en las calles cercanas a la FIUBA (Av. Paseo Colón 850, CABA).

Antes de manejar hasta la zona, cualquier persona puede consultar el mapa y ver si hay lugar disponible, sin necesidad de dar vueltas a ciegas buscando dónde estacionar.

---

## ✨ Funcionalidades

- **Mapa en tiempo casi real** — visualización de lugares de estacionamiento con pines de colores según su estado actual.
- **Reportes con ciclo de vida** — cualquier usuario puede reportar el estado de un lugar (`libre`, `ocupado`, `me estoy yendo`). Los reportes expiran automáticamente si no hay actividad reciente, y el lugar pasa a estado `sin información`.
- **Confirmaciones y desmentidas** — la comunidad puede votar si un reporte existente sigue siendo válido.
- **Restricciones horarias** — cada lugar tiene asociadas las reglas vigentes de la zona (horarios prohibidos, carga y descarga, etc.). El sistema combina la disponibilidad reportada con la restricción horaria actual, mostrando una advertencia si el lugar no se puede usar en ese momento aunque esté "libre".
- **Panel de administración** — ABM completo de lugares y restricciones.

---

## 🗂️ Entidades

| Entidad | Descripción |
|---|---|
| `spots` | Lugares de estacionamiento en la calle |
| `reportes` | Estados reportados por la comunidad para cada lugar |
| `restricciones` | Reglas horarias vigentes asociadas a cada lugar |

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | HTML, CSS, JavaScript vanilla |
| Mapa | [Leaflet.js](https://leafletjs.com/) |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL |
| Contenedores | Docker + Docker Compose |

---

## 📁 Estructura del proyecto

> ⚠️ El backend todavía vive dentro de `backend de prueba (pokeAPI)/`, que arrancó como una maqueta siguiendo el ejemplo de la cátedra (con entidades de Pokémon). Se está migrando gradualmente a las entidades reales de FIUBAMIENTO (`spots`, `reportes`, `restricciones`) y se va a renombrar más adelante.

```
FIUBAMIENTO/
├── backend de prueba (pokeAPI)/   # Backend (Node.js + Express + Postgres) — en migración
│   ├── app/
│   │   ├── api/
│   │   ├── app.js
│   │   └── package.json
│   ├── data/
│   │   ├── 0001_schemas.sql
│   │   └── 02_seeds.sql
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/                      # (por agregar)
└── README.md
```

---

## 🚀 Cómo levantar el backend

### Requisitos previos

- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/) instalados.
- Git instalado.

### Pasos

1. Clonar el repositorio:

```bash
git clone git@github.com:angiemoshkov/FIUBAMIENTO.git
cd FIUBAMIENTO
```

2. Entrar a la carpeta del backend y levantar los servicios:

```bash
cd "backend de prueba (pokeAPI)"
docker compose up --build
```

Esto levanta dos servicios:

| Servicio | Puerto local |
|---|---|
| Backend (API) | http://localhost:3000 |
| PostgreSQL | localhost:5433 |

La base de datos se inicializa automáticamente con el schema y los datos de prueba al primer arranque (carpeta `data/`).

---

## 🔌 Endpoints planeados de la API

### Spots

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v1/spots` | Lista todos los spots con su estado actual calculado |
| `GET` | `/api/v1/spots/:id` | Detalle de un spot |
| `POST` | `/api/v1/spots` | Crear un nuevo spot |
| `PUT` | `/api/v1/spots/:id` | Actualizar un spot |
| `DELETE` | `/api/v1/spots/:id` | Eliminar un spot |

### Reportes

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v1/spots/:id/reportes` | Historial de reportes de un spot |
| `POST` | `/api/v1/spots/:id/reportes` | Crear un nuevo reporte |
| `POST` | `/api/v1/reportes/:id/votar` | Confirmar o desmentir un reporte |

### Restricciones

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v1/spots/:id/restricciones` | Restricciones de un spot |
| `POST` | `/api/v1/spots/:id/restricciones` | Agregar una restricción |
| `PUT` | `/api/v1/restricciones/:id` | Actualizar una restricción |
| `DELETE` | `/api/v1/restricciones/:id` | Eliminar una restricción |

### Lógica de estado en `GET /api/v1/spots`

Cada spot devuelve un campo `estado_actual` calculado en el backend según estas reglas, en orden de prioridad:

1. `restringido` — hay una restricción horaria activa en este momento.
2. `sin_info` — el último reporte existe pero ya expiró.
3. `sin_reportes` — nunca se reportó nada para ese lugar.
4. `libre` / `ocupado` / `saliendo` — el reporte más reciente es válido.

---

## 🖼️ Capturas de pantalla

> *(hay que gregar capturas del mapa, el panel de spot y el panel de administración una vez que el frontend esté implementado)*

---

## 👥 Integrantes

| Nombre | GitHub |
|---|---|
| Ana Angelica Moshkov | angiemoshkov |
| Juan Manuel Bazan | jbazan-bazia |
| Emiliano Romano | emromanofiuba |

---

## 📝 Uso de Inteligencia Artificial

En el desarrollo de este proyecto se utilizaron asistentes de IA como herramienta de apoyo. Todo el código presente en el repositorio fue revisado, comprendido y validado por los integrantes del grupo.
