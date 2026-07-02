document.addEventListener("DOMContentLoaded", () => {
  const tweetUser = document.getElementById("tweet-user");
  const tweetText = document.getElementById("tweet-text");
  const simulateFailure = document.getElementById("simulate-failure");
  const btnSubmit = document.getElementById("btn-submit");
  const btnSpinner = btnSubmit.querySelector(".btn-spinner");
  
  // Pipeline Elements
  const stepApi = document.getElementById("step-api");
  const stepDomain = document.getElementById("step-domain");
  const stepIntegration = document.getElementById("step-integration");
  const stepPersistence = document.getElementById("step-persistence");

  // Stats
  const statTotal = document.getElementById("stat-total");
  const statLatency = document.getElementById("stat-latency");
  const statFallback = document.getElementById("stat-fallback");
  const statDb = document.getElementById("stat-db");
  const metricsTbody = document.getElementById("metrics-tbody");
  const btnRefresh = document.getElementById("btn-refresh");

  // Fetch initial metrics on load
  refreshMetrics();

  // Handle seed button clicks
  document.querySelectorAll(".btn-seed").forEach(btn => {
    btn.addEventListener("click", () => {
      tweetText.value = btn.getAttribute("data-text");
    });
  });

  // Refresh button click
  btnRefresh.addEventListener("click", refreshMetrics);

  // Submit Mention Click
  btnSubmit.addEventListener("click", async () => {
    const text = tweetText.value.trim();
    let username = tweetUser.value.trim().replace(/^@/, "");
    
    if (!username) username = "chileno_impulsivo";
    if (!text) {
      alert("Por favor escribe el contenido del tweet.");
      return;
    }

    // Reset pipeline styling and logs
    resetPipeline();
    
    // Disable elements
    btnSubmit.disabled = true;
    btnSpinner.classList.remove("hidden");

    const shouldFail = simulateFailure.checked;

    try {
      // 1. Highlight API Layer
      setActiveStep(stepApi, "POST /x/webhook - Payload recibido de X API.<br>Sanitizando caracteres especiales...");
      await delay(600);
      setSuccessStep(stepApi, "✓ Webhook verificado. Payload estructurado correctamente.");

      // 2. Highlight Domain Layer
      setActiveStep(stepDomain, "verificationService - Analizando concordancia semántica local...");
      await delay(600);
      setSuccessStep(stepDomain, "✓ Preprocesamiento listo. Delegando al adaptador de integración...");

      // 3. Highlight Integration Layer
      let logMsg = "nlpAdapter - Llamando al motor NLP/IA externo...";
      if (shouldFail) {
        logMsg += "<br><span style='color:#EF4444;'>Intento 1 fallido: Network Error (Timeout 2s)</span>";
        setActiveStep(stepIntegration, logMsg);
        await delay(800);
        
        logMsg += "<br><span style='color:#EF4444;'>Intento 2 fallido: Network Error (Timeout 2s)</span>";
        setActiveStep(stepIntegration, logMsg);
        await delay(800);

        logMsg += "<br><span style='color:#EF4444;'>Intento 3 fallido: Network Error (Timeout 2s)</span><br><span style='color:#F59E0B;'>Límite de reintentos excedido. Aplicando fallback de resiliencia...</span>";
        setActiveStep(stepIntegration, logMsg);
        await delay(600);
      } else {
        setActiveStep(stepIntegration, logMsg);
        await delay(800);
      }

      // Trigger the real backend webhook request!
      const requestPayload = {
        data: {
          id: "tweet_17834927493",
          text: text,
          author_id: `usr_${btoa(username).slice(0, 8)}`,
          created_at: new Date().toISOString()
        },
        simulateFailure: shouldFail
      };

      const response = await fetch("/x/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-simulate-nlp-failure": shouldFail ? "true" : "false"
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Fallo en la comunicación con el servidor.");
      }

      const resData = await response.json();
      
      // Complete Integration Step
      if (shouldFail) {
        setSuccessStep(stepIntegration, "✓ Fallback aplicado: Veredicto seguro 'Impreciso' generado.");
      } else {
        setSuccessStep(stepIntegration, `✓ Análisis NLP completado en ${resData.analysis.integration?.attempts || 1} intento(s).`);
      }

      // 4. Highlight Persistence Layer
      const dbMode = resData.analysis.integration?.fallbackApplied ? "fallback" : "ok";
      setActiveStep(stepPersistence, `metricsRepository - Guardando registro de auditoría en PostgreSQL...`);
      await delay(600);
      
      const userIdAnon = btoa(username).slice(0, 12);
      setSuccessStep(
        stepPersistence, 
        `✓ Métrica registrada. Usuario anonimizado: ${userIdAnon}...<br>Latencia registrada: ${resData.latencyMs} ms`
      );

      // Render the reply on dynamic mock timeline feed
      appendThreadToFeed(username, text, resData.analysis);
      
      // Refresh general metrics tables
      refreshMetrics();

    } catch (err) {
      console.error(err);
      setErrorStep(stepIntegration, `Fallo técnico en la orquestación: ${err.message}`);
    } finally {
      // Re-enable elements
      btnSubmit.disabled = false;
      btnSpinner.classList.add("hidden");
    }
  });

  // Helpers for animations and styles
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function resetPipeline() {
    [stepApi, stepDomain, stepIntegration, stepPersistence].forEach(step => {
      step.className = "pipeline-step";
      const log = step.querySelector(".step-log");
      log.classList.add("hidden");
      log.innerHTML = "";
    });
  }

  function setActiveStep(step, logHtml) {
    step.className = "pipeline-step active";
    const log = step.querySelector(".step-log");
    log.classList.remove("hidden");
    log.innerHTML = logHtml;
  }

  function setSuccessStep(step, logHtml) {
    step.className = "pipeline-step success";
    const log = step.querySelector(".step-log");
    log.classList.remove("hidden");
    log.innerHTML = logHtml;
  }

  function setErrorStep(step, logHtml) {
    step.className = "pipeline-step error";
    const log = step.querySelector(".step-log");
    log.classList.remove("hidden");
    log.innerHTML = logHtml;
  }

  // Syntax highlighting for X (mentions & hashtags)
  function formatTweetText(text) {
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Highlight handles (@username) and hashtags (#tag) in X blue
    escaped = escaped.replace(/(@\w+)/g, '<span style="color: var(--primary); font-weight: 600;">$1</span>');
    escaped = escaped.replace(/(#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)/g, '<span style="color: var(--primary); font-weight: 600;">$1</span>');
    return escaped;
  }

  // Dynamic counter animation for stats
  function animateCount(element, targetValue, duration = 800, suffix = "") {
    const startValue = parseInt(element.textContent.replace(/[^\d]/g, "")) || 0;
    if (startValue === targetValue) {
      element.textContent = `${targetValue}${suffix}`;
      return;
    }
    const startTime = performance.now();

    function updateCount(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutQuad curve
      const easeProgress = progress * (2 - progress);
      
      const currentValue = Math.round(startValue + (targetValue - startValue) * easeProgress);
      element.textContent = `${currentValue}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        element.textContent = `${targetValue}${suffix}`;
      }
    }

    requestAnimationFrame(updateCount);
  }

  // Prepend thread dynamically to the visual feed
  function appendThreadToFeed(username, userText, analysis) {
    const feed = document.getElementById("twitter-feed");
    const placeholder = document.getElementById("empty-feed-placeholder");
    if (placeholder) {
      placeholder.remove();
    }

    const threadDiv = document.createElement("div");
    threadDiv.className = "tweet-thread";

    const ver = analysis.veredicto.toLowerCase();
    const formattedUserText = formatTweetText(userText);
    
    // Determine provider label
    let originLabel = "Simulador local";
    if (analysis.integration?.provider === "gemini-api") {
      originLabel = "🔍 Búsqueda en Vivo";
    } else if (analysis.integration?.provider === "external-nlp") {
      originLabel = "IA Externa";
    } else if (analysis.integration?.fallbackApplied) {
      originLabel = "⚠️ Fallback";
    } else if (analysis.isDemoFact) {
      originLabel = "💾 Hecho Local";
    }

    threadDiv.innerHTML = `
      <!-- Tweet Original -->
      <div class="tweet-card user-tweet">
        <div class="tweet-avatar user-avatar"></div>
        <div class="tweet-body">
          <div class="tweet-meta">
            <span class="user-display">Chileno Impulsivo</span>
            <span class="user-handle">@${username}</span>
            <span class="tweet-bullet">•</span>
            <span class="tweet-time">Ahora</span>
          </div>
          <p class="tweet-text-content">${formattedUserText}</p>
        </div>
      </div>

      <!-- Flecha Conector -->
      <div class="thread-line"></div>

      <!-- Tweet Respuesta Bot -->
      <div class="tweet-card bot-tweet">
        <div class="tweet-avatar bot-avatar"></div>
        <div class="tweet-body">
          <div class="tweet-meta">
            <span class="user-display">Bot Verificador X</span>
            <span class="user-handle">@BotVerificadorX</span>
            <span class="tweet-bullet">•</span>
            <span class="tweet-time">Hace unos segundos</span>
            <span class="origin-badge">${originLabel}</span>
          </div>
          
          <!-- Badge de Veredicto -->
          <div class="verdict-banner">
            <span class="verdict-title">Veredicto:</span>
            <span class="verdict-badge ${ver}">${analysis.veredicto.toUpperCase()}</span>
            <span class="confidence-val">${analysis.confianza}% confianza | ${analysis.certeza || 0}% certeza</span>
          </div>

          <!-- Contenido de Respuesta -->
          <p class="tweet-text-content">En respuesta a tu consulta sobre "${analysis.tema}": El veredicto es ${analysis.veredicto.toUpperCase()} (${analysis.confianza}% confianza). Justificación: ${analysis.justificacion}</p>
          
          <div class="verification-details">
            <p><strong>Desglose:</strong> <span>${analysis.desglose || 'Desglose no disponible'}</span></p>
            <p><strong>Contexto:</strong> <span>${analysis.contexto}</span></p>
            <p><strong>Recomendación:</strong> <span>${analysis.recomendacion}</span></p>
          </div>
        </div>
      </div>
    `;

    // Prepend to show latest at the top
    feed.insertBefore(threadDiv, feed.firstChild);
    
    // Smooth scroll to the new thread
    threadDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function refreshMetrics() {
    try {
      const response = await fetch("/metrics");
      if (!response.ok) throw new Error("No se pudieron cargar las métricas.");
      
      const data = await response.json();
      
      // Animate count for total verifications
      animateCount(statTotal, data.total, 800);

      // Calcular promedios
      if (data.total > 0) {
        const sumLat = data.metrics.reduce((acc, m) => acc + m.latency_ms, 0);
        const avgLat = Math.round(sumLat / data.total);
        animateCount(statLatency, avgLat, 800, " ms");
        
        const fallbackCount = data.metrics.filter(m => m.status === "fallback").length;
        const fallbackRate = Math.round((fallbackCount / data.total) * 100);
        animateCount(statFallback, fallbackRate, 800, "%");

        // Check if DB is active or in-memory
        const hasDbPersistence = data.metrics.some(m => m.persistence === "PostgreSQL");
        statDb.textContent = hasDbPersistence ? "PostgreSQL Relacional" : "Fallback en Memoria";
        
        // Populate table rows
        metricsTbody.innerHTML = "";
        data.metrics.forEach(m => {
          const tr = document.createElement("tr");
          
          const truncatedText = m.text.length > 40 ? m.text.slice(0, 40) + "..." : m.text;
          const labelVerdict = m.veredicto.toLowerCase();
          
          tr.innerHTML = `
            <td class="monospace">${m.id.slice(0, 8)}...</td>
            <td class="monospace">${m.user_id.slice(0, 10)}...</td>
            <td title="${m.text}">${truncatedText}</td>
            <td><span class="table-verdict ${labelVerdict}">${m.veredicto}</span></td>
            <td class="monospace">${m.confianza}%</td>
            <td class="monospace">${m.certeza !== undefined ? m.certeza + '%' : 'N/A'}</td>
            <td>${m.source}</td>
            <td class="monospace">${m.latency_ms} ms</td>
            <td class="monospace">${m.attempts}</td>
            <td><span class="badge-persist" style="color: ${m.persistence === 'PostgreSQL' ? '#10B981' : '#F59E0B'}">${m.persistence}</span></td>
          `;
          metricsTbody.appendChild(tr);
        });
      } else {
        statLatency.textContent = "0 ms";
        statFallback.textContent = "0%";
        statDb.textContent = "Sin registros";
        metricsTbody.innerHTML = `
          <tr>
            <td colspan="10" class="empty-table">No hay logs registrados en base de datos.</td>
          </tr>
        `;
      }
    } catch (error) {
      console.error(error);
    }
  }
});
