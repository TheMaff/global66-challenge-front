# Growth / Performance – Global66 `/precio/*`

Este documento resume el estado actual de la página de tipo de cambio y propone un plan de mejora continuo desde la perspectiva de producto + growth + performance.

---

## 1. Baseline: resultados Lighthouse

Reporte: `reports/localhost_3000-20251113T193338.json`

Scores (desktop, entorno dev):

- **Performance:** 85/100
- **Accesibilidad:** 91/100
- **Best Practices:** 100/100
- **SEO:** 100/100

Puntos técnicos relevantes del reporte:

- 4 MB de peso total de la página (`total-byte-weight` ≈ 4 MB) debido principalmente a imágenes grandes.
- Buen **Largest Contentful Paint** (0.97 de score) pero **TBT / Time to Interactive** medio (score 0.57) por carga de JS inicial.
- `html-has-lang` en 0: falta atributo `lang` en la etiqueta `<html>`.
- Avisos de:
  - `unsized-images` – imágenes sin `width/height` explícitos.
  - `modern-image-formats` – imágenes en PNG/JPG sin WebP/AVIF.
  - `unminified-*` y `unused-*` – esperable en entorno dev; en build de producción se resuelve en gran parte.

Conclusión: estamos en **zona verde** pero con margen de mejora clara en peso de recursos e indicadores de interactividad.

---

## 2. Metas técnicas y de negocio

### 2.1. Metas técnicas

- Llevar **Performance ≥ 90** de manera consistente en entorno producción.
- Mantener **A11y ≥ 95** con foco en:
  - `lang` en `<html>`.
  - Labels/roles en formularios y botones.
- Mantener **Best Practices / SEO = 100** tras futuros cambios.

Métricas a seguir:

- LCP (Largest Contentful Paint).
- TBT (Total Blocking Time) y TTI (Time to Interactive).
- Peso total de la página y número de requests.
- Tasa de errores de la API interna `/api/rate`.

### 2.2. Metas de negocio

- Maximizar tráfico orgánico a `/precio/*` por keywords como:
  - “precio dólar”, “valor dólar hoy”, “USD a CLP”, etc.
- Aumentar **CTR de la página** en resultados orgánicos.
- Aumentar **conversión a lead** del formulario “¿Quieres que te contactemos?”.

Métricas de negocio:

- Sesiones orgánicas (Search Console + Analytics).
- CTR orgánico por keyword.
- Envíos de formulario (`lead_submit`).
- Scroll depth (para saber cuánto contenido se ve).

---

## 3. Análisis de oportunidades

### 3.1. Performance

- **Imágenes pesadas** (4 MB totales):
  - Assets PNG grandes para los mockups de la app / tarjetas.
  - Algunas sin dimensiones (`unsized-images`), generan layout shifts.
- **JS inicial**:
  - Aunque la página es simple, el bundle incluye librerías de Nuxt + Axios.
  - `total-blocking-time` y `max-potential-fid` muestran margen de optimización.
- **Cache / headers**:
  - En dev los assets no tienen buena `cache-control`; en prod se puede configurar TTL altos para imágenes estáticas.

### 3.2. Accesibilidad

- Falta `lang="es-CL"` en `<html>`.
- Formularios:
  - Necesitan `label` y `aria-*` bien enlazados a los inputs.
  - Estados de error y éxito más explícitos para lectores de pantalla.

### 3.3. SEO

- Scores en 100, pero hay puntos a vigilar cuando el proyecto escale:
  - Mantener `canonical` correcto en cada slug `/precio/*`.
  - `hreflang` por país cuando se soporten más monedas (es-CL, es-PE, etc.).
  - Mantener contenido “fresco” (fecha de actualización visible).

---

## 4. Plan de mejora (por fases)

### 4.1. Quick wins (0–3 días)

**Objetivo:** subir Performance a 90+ y cerrar gaps evidentes de A11y/SEO.

1. **Atributo `lang` en `<html>`**

   - Configurar en `nuxt.config.js`:
     ```js
     head: {
       htmlAttrs: {
         lang: 'es-CL'
       }
     }
     ```
   - Vuelve a correr Lighthouse para ver `html-has-lang` en 1.0.

2. **Dimensiones de imágenes (`unsized-images`)**

   - Para cada `<img>` en el hero y banner:
     - Añadir `width` y `height` fijos adecuados.
     - Mantener el `object-fit`/`max-width:100%` via CSS para responsividad.
   - Resultado: menor CLS, mejor experiencia y mejora en el score de `unsized-images`.

3. **Cargar imágenes no críticas con `loading="lazy"`**

   - Hero principal (LCP) se mantiene sin lazy.
   - Todas las imágenes “decorativas” (mockups del bloque inferior, etc.) → `loading="lazy"`.
   - Reduce trabajo inicial del main thread.

4. **Revisión mínima de accesibilidad del formulario**
   - Asegurar:
     - `<label for="name">Nombre</label>` y `<input id="name" ... />`, idem Email.
     - `aria-invalid`, `aria-describedby` para mensajes de error.
   - Mejora accesibilidad sin cambiar layout.

---

### 4.2. Mejora media (1–2 semanas)

**Objetivo:** robustecer performance y preparar la página para crecer.

1. **Optimización de imágenes**

   - Generar versiones WebP/AVIF de los assets grandes.
   - Usar tamaños específicos por breakpoint (ej.: `srcset` o componente de imágenes de Nuxt).
   - Mantener versión fallback en PNG/JPG para navegadores antiguos.

2. **Build de producción + análisis**

   - Correr Lighthouse contra `npm run build && npm run start` en vez de dev.
   - Verificar que advertencias de `unminified-*` y `unused-*` se reduzcan (Webpack/Nuxt se encargan de la minificación en prod).
   - Ajustar `nuxt.config.js` para:
     - Activar `analyze` cuando se necesite revisar tamaño de bundles.
     - Separar chunks comunes si la app crece.

3. **Cache de API interna `/api/rate`**
   - Ya existe caché in-memory de 60s; revisar:
     - Logs de tasa de errores.
     - Latencias.
   - Si la API externa se vuelve inestable:
     - Añadir persistencia a disco o Redis para valores de respaldo.
     - Alertas simples (log aggregation o monitor en el server).

---

### 4.3. Largo plazo / Growth (3–6 semanas)

**Objetivo:** usar la página como canal de adquisición y de experimentación.

1. **Tracking de eventos**

   - Implementar `lead_submit` y `cta_click` via Analytics / Tag Manager.
   - Medir:
     - % usuarios que ven el hero y scrollean hasta el bloque inferior.
     - Conversión a formulario enviado.

2. **A/B tests de mensaje y CTA**

   - Hipótesis ejemplo:
     - H1 con beneficio (“Ahorra comisiones al convertir USD a CLP”) vs. H1 informativo (“Valor del dólar hoy”).
     - CTA orientado a acción (“Abre tu cuenta en minutos”) vs. “Quiero más info”.
   - Métrica principal: tasa de envío de formulario.

3. **Contenido adicional SEO-friendly**
   - Explicación breve sobre:
     - Cómo se calcula el tipo de cambio.
     - Diferencia entre tipo de cambio Global66 vs bancos tradicionales.
   - FAQ en formato que luego se pueda marcar con schema.org (FAQPage) si se integran microdatos en una fase posterior.

---

## 5. Uso de IA y tiempo estimado

- **Tiempo estimado invertido** :
  - Setup del proyecto + estructura inicial: 2 hora
    (Nuxt, Tailwind, layout, rutas, assets)
  - API interna /api/rate con caché + fallback: 2 hora
    (serverMiddleware, manejos de error, mock seguro)
  - Integración SSR + página /precio/\*: 1 horas  
    (asyncData, formateos, fallback seguro)
  - SEO (title, description, canonical, hreflang): 0.5 horas
  - Revisión Lighthouse + redacción del plan GROWTH.md: 1.5 horas
  - Ajustes menores (lint, husky, fixes, commits limpios): 0.5 horas
- **Uso de IA (ChatGPT)**:
  - Acelera scaffolding de código (API interna, helpers).
  - Aporta en la redacción inicial de este documento y en sugerencias de optimización.
  - El criterio final y la priorización vienen del contexto de negocio (dólar hoy, captación de leads y performance web).

Este documento sirve como base de trabajo para iterar y registrar futuros cambios (nuevos runs de Lighthouse, nuevas hipótesis de experimentos y resultados de A/B tests).
