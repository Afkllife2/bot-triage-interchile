# ADR-01: Cálculo Financiero Determinista y Arnés Anti-Alucinación fuera del LLM

- **Estado:** Aceptada e implementada (`src/cotizador.js`, `src/arneses.js`, `src/kronos.js`)
- **Requerimientos Vinculados:** `RF-03` (`OE-2`), `RF-04` (`OE-3`), `RNF-02` (`Seguridad/Integridad`)

## Contexto
Los Modelos de Lenguaje (LLM) exhiben alucinaciones numéricas y extrínsecas cuando estiman precios, aplican porcentajes de IVA o nombran repuestos/equipos inexistentes (Ji et al., 2023). En **InterChile Clima SpA**, entregar un presupuesto errado o inventar compatibilidad con un equipo no trabajado genera riesgo comercial y operativo directo (`R-02`, `R-16`).

## Alternativas Evaluadas
1. **Alternativa A (Seleccionada): Motor Determinista Desacoplado (`src/cotizador.js` + `src/arneses.js`)** — Gemini se restringe vía esquema `Zod` (`src/brain.js`) a clasificar intención, equipo y urgencia; los precios CLP (Subtotal Neto + IVA `19%`) se calculan con código puro en `src/cotizador.js` (retornando `null` ante `[dato por confirmar]` o proyectos), y `src/arneses.js` sanitiza entidades inexistentes contra `src/kronos.js` antes de guardar o responder.
2. **Alternativa B (Descartada): Solicitar cálculo e inventario directo al LLM vía System Prompt / Few-Shot** — Dependencia estocástica de que el LLM no invente tarifas ni olvide sumar IVA 19%.

## Matriz de Decisión Ponderada (Escala 1 a 5 · Peso = 100%)

| Criterio (derivado de RF/RNF) | Peso | Alt. A · Determinista fuera LLM | Alt. B · Prompt LLM Directo |
| :--- | :---: | :---: | :---: |
| **0% Alucinación aritmética y de catálogo (`RF-03`, `RF-04`)** | `50%` | `5` | `2` |
| **Auditabilidad y cobertura de pruebas unitarias (`RNF-03`)** | `30%` | `5` | `2` |
| **Velocidad y costo de inferencia (`RNF-01`)** | `20%` | `4` | `4` |
| **Puntaje Ponderado Total** | **`100%`** | **`4,80`** | **`2,40`** |

## Consecuencias y Evidencia
- `src/cotizador.js` alcanzó **`100%` cobertura de líneas** y **`96,92%`** `src/arneses.js` (`test/arneses.test.js` `15/15`, `test/sprint3.test.js`).
- Exige mantener actualizado el tarifario y sincronizar el catálogo remoto `GET /api/kronos/catalogo` cuando Kronos 2.0 entre en producción (`DT-01`).
