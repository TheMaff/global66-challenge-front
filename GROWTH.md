# /precio/* — Growth Thinking

## 1) Metas técnicas y de negocio
- **Técnicas**: LCP, CLS, TTFB, TBT; % render SSR OK; tasa de errores 5xx/4xx de endpoints; tiempo de respuesta `/api/rates`.
- **Negocio**: CTR de CTA principal; envío de formulario (lead_submit); conversión a lead por divisa; scroll depth; tiempo en página; tráfico orgánico por keyword (“precio dólar”, “valor dólar hoy”) y por divisa (CLP, PEN).

## 2) Caída 20% en orgánico (“precio dólar” CLP) — Plan 72h
- **0–12h Diagnóstico**: Search Console (pérdida de impresiones/CTR/posición en es-CL); crawl con ScreamingFrog de `/precio/peso-chileno`; ver title/description/canonical/hreflang en HTML SSR; comprobar Lighthouse SEO; comparar SERP features (noticias/people also ask).
- **12–48h Acciones**:
  - Ajuste de **title** y **meta description** con intent informativo + moneda CLP.
  - Verificar **canonical** correcto y **hreflang** `es-CL`.
  - Añadir sección FAQs (marcado FAQPage) y snippet de tipo de cambio actualizado (`asOf` visible).
  - Mejorar **LCP** (optimizar imagen hero / `fetchpriority=high` y `preload` fuente si aplica).
- **48–72h Monitor**: re-crawleo, inspección URL en GSC, comparar métricas (CTR/posiciones), alertas automáticas de caída.

## 3) 3 mejoras de velocidad sin sacrificar SEO
- **Preload** de imagen LCP del hero (si pesa) y `fetchpriority="high"`.
- **Code-splitting** de componentes secundarios y carga diferida de imágenes no críticas (`loading="lazy"`).
- **Critical CSS** para above-the-fold (o Tailwind JIT + purge bien configurado para reducir CSS).

## 4) 2 hipótesis de conversión + A/B
- **H1 más claro + beneficio** (“Ahorra comisiones al convertir USD a CLP” vs “Valor del dólar hoy”).
- **CTA sticky** en viewport en mobile.
- **A/B** con GA4+GTM (Experiments sencillo): métricas → CTR del CTA y lead_submit; ejecutar 7–14 días o hasta significancia.

## 5) Tiempo e IA
- 

---

# Pruebas manuales rápidas

- **Rates OK**  
  `curl http://localhost:3000/api/rates`  
  `curl "http://localhost:3000/api/rates?base=USD&target=CLP"`

- **Lead OK (sin Sheets)**  
  `curl -X POST http://localhost:3000/api/leads -H "Content-Type: application/json" -d '{"name":"Marcos","email":"marcos@demo.cl","currency":"CLP"}'`

- **Lead OK (con Sheets)**  
  Setea `SHEETS_WEBHOOK_URL` y repite el POST; debería devolver `{ ok: true, upstream: 200 }`.

---