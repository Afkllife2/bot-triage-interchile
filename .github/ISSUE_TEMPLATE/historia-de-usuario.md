# Historia de Usuario (A3 · Formato BDD Obligatorio INSW422)

**Historia:** Como [rol / stakeholder] quiero [capacidad del sistema] para [beneficio comercial u operativo medible].  
**Requerimiento Asociado:** `RF-XX` / `RNF-XX` · **Objetivo Específico:** `OE-X` · **Prioridad:** `Must / Should / Could` · **Sprint:** `Sprint X`

---

## Criterios de Aceptación (Dado / Cuando / Entonces)

### Escenario 1: Flujo Positivo Principal (`CP-XX-01`)
- **Dado** [precondición o estado inicial verificable en BD/canal],
- **Cuando** [acción del usuario o evento del sistema],
- **Entonces** [resultado funcional esperado + código HTTP o persistencia verificable].

### Escenario 2: Flujo Negativo / Borde / Contingencia (`CP-XX-02`)
- **Dado** [condición inválida, dato inexistente, colisión horaria o falla de autorización],
- **Cuando** [se ejecuta la petición o el turno],
- **Entonces** [respuesta de rechazo/sanitización controlada (`400`, `401`, `403`, `409`, `[dato por confirmar]`) sin degradar el servicio].

---

## Aprobación del Stakeholder (Obligatorio antes de estado "Hecha / Listo")
- **Estado:** `Por hacer` / `En curso` / `En revisión` / `Aprobada por stakeholder` / `Hecha`
- **Aprobado por:** [Nombre completo distinto del estudiante · Cargo / Rol · Fecha `DD-MM-AAAA`]
- **Evidencia adjunta en ticket y repo:** Commit SHA + reporte/captura verificable en `docs/`.
