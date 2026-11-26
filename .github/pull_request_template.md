## Qué cambia
- Ticket / HU Jira: `[AAI-XX]` (`INT-HU-XX`): <descripción breve del cambio>
- Rama origen -> destino: `feat/AAI-XX-...` -> `develop` / `main`

## Trazabilidad Hito 3 (Cadena de Evidencia INSW422)
- **Objetivo Específico (`A1`):** `OE-X`
- **Requerimiento (`A2`):** `RF-XX` / `RNF-XX`
- **Lugar en Modelo UML (`A7`):** <Caso de Uso / Diagrama de Secuencia / Tabla ER>
- **Casos de Prueba (`A5`):** `CP-...` (incluye caso negativo/borde)

## Evidencia Verificable y Checklist DoD
- [ ] Reporte de pruebas Jest (`npx jest --coverage --runInBand`) al 100% PASS sin *open handles*
- [ ] Cobertura en lógica de negocio `>= 70%`
- [ ] Evidencia fechada ligada al commit en `docs/pruebas/` o `docs/evidencias_png/`
- [ ] Actualizada la matriz bidireccional en `docs/trazabilidad.md`
- [ ] Aprobación explícita de stakeholder registrada en el ticket (`nombre · rol · fecha`)
