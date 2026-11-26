# ADR-02: Motor de Base de Datos Relacional (PostgreSQL) y Bloqueo Anti-Topones

- **Estado:** Aceptada e implementada (`src/db.js`, `supabase/migrations/*.sql`)
- **Requerimientos Vinculados:** `RF-05`, `RF-06` (`OE-4`), `RNF-01` (`Eficiencia`), `RNF-02` (`Integridad`)

## Contexto
El sistema requiere integridad referencial estricta entre `clientes`, `casos_triage` y `reuniones`, paginación estable para sincronizar con Kronos 2.0 (`KRON2-152`), detección de colisiones de edición (`expected_updated_at -> HTTP 409`) y **cero topones horarios** cuando WhatsApp y el Dashboard reservan horas simultáneamente con Benjamín Yáñez (`R-19`).

## Alternativas Evaluadas
1. **Alternativa A (Seleccionada): PostgreSQL gestionado en Supabase (`pg` Pool SSL + `SELECT FOR UPDATE` + Índice Único Parcial `uq_reuniones_slot_activo`)** — Transacciones ACID reales con captura de `SQLSTATE 23505` -> `HTTP 409 HORARIO_OCUPADO`, `created_at` inmutable y preservación de microsegundos en cursores (`updated_at+id`).
2. **Alternativa B (Descartada): Base NoSQL Documental (MongoDB)** — Esquema flexible de documentos JSON por conversación, pero mayor complejidad para garantizar unicidad condicional parcial (`WHERE estado <> 'cancelada'`) y bloqueos pesimistas entre dos colecciones.

## Matriz de Decisión Ponderada (Escala 1 a 5 · Peso = 100%)

| Criterio (derivado de RF/RNF) | Peso | Alt. A · PostgreSQL (Supabase) | Alt. B · MongoDB Documental |
| :--- | :---: | :---: | :---: |
| **Integridad transaccional Anti-Topón y `409 Conflict` (`RF-05`, `RF-06`)** | `40%` | `5` | `3` |
| **Modelo relacional 1:N (`clientes` -> `tickets/reuniones`)** | `30%` | `5` | `3` |
| **Rendimiento de consulta y pool SSL gestionado (`RNF-01`)** | `30%` | `4` | `4` |
| **Puntaje Ponderado Total** | **`100%`** | **`4,70`** | **`3,30`** |

## Consecuencias y Evidencia
- Cero reservas superpuestas verificadas en `test/db-contrato.test.js` (`6/6 PASS`) y prueba viva en Supabase (`Evidencia_AAI_103`).
- Exige administrar migraciones SQL versionadas en `supabase/migrations/` (`20260824`, `20261019`, `20261122`).
