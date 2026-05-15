<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🛡️ Obsidian Flux Monitor (MONITOR)

**MONITOR** es una aplicación de alto rendimiento inspirada en el estilo visual y funcional de Zabbix y centros de operaciones de red (NOC). Su objetivo principal es realizar *health checks* en tiempo real a un conjunto de URLs parametrizables, medir sus tiempos de respuesta y ofrecer una interfaz técnica de estética premium.

---

## ✨ Características Principales

- **Monitoreo en Tiempo Real:** Seguimiento constante de estados HTTP, disponibilidad (Online/Offline) y latencia.
- **Visualización "Mosaico Vivo":** Cuadrícula técnica organizada en grupos de 16 slots para mantener la simetría visual.
- **Panel de Analíticas Avanzado:** 
  - Rankings de tiempos de acceso.
  - Distribución global de disponibilidad (Donut Chart).
  - Historial de latencia global (Area Chart).
- **Sincronización Inteligente:** Ciclos de refresco automáticos de 120 segundos con barra de progreso visual.
- **Proxy Técnico:** Backend en Express.js que evita restricciones de CORS y mide latencia real.

---

## ⚙️ Reglas de Negocio y Funcionalidades Core

### 1. Sistema de Monitoreo & Health Check
- **Métricas:** Estado HTTP, disponibilidad, y latencia (ms).
- **Frecuencia:** Cuenta regresiva de **120 segundos**. Al llegar a 0, se sincronizan todos los monitores.
- **URLs Preconfiguradas:** CAS GDE, Portal Nacional, y BPM DNA2.

### 2. Estructura de la Interfaz
- **Dashboard (Mosaico Vivo):** 
  - Tarjetas con: Nombre, URL, estado (pulso verde/rojo), latencia y mini-gráfico de tendencia.
  - **Paginación:** Máximo 16 sitios por pantalla. Slots vacíos visuales para mantener la cuadrícula.
- **Analytics:** Resumen global de salud, ranking de velocidad e historial de rendimiento.
- **Admin:** Gestión completa (añadir/eliminar) de endpoints de monitoreo.

---

## 🎨 Lineamientos de Diseño (Obsidian Flux)

La interfaz respeta estrictamente la estética NOC:
- **Background Principal:** `#0A0B0E` (Obsidian profundo)
- **Superficies (Cards):** `#12141A` (Gris técnico con Glassmorphism).
- **Estados:**
  - `#10B981` (Esmeralda) -> Online / 200 OK.
  - `#F43F5E` (Rosa/Rojo) -> Offline / Errores.
  - `#F59E0B` (Ámbar) -> Latencia alta.
- **Tipografía:** Estética técnica (tipo *JetBrains Mono*) con textos en mayúsculas y espaciado expandido.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19 + Vite + Tailwind CSS 4.
- **Backend / Proxy:** Express.js.
- **Visualización:** Recharts.
- **Animaciones:** Motion.

---

## 🚀 Instalación y Uso Local

1. **Instalar dependencias:** `npm install`
2. **Configurar .env:** (Opcional) `GEMINI_API_KEY` en `.env.local`
3. **Ejecutar:** `npm run dev`
4. **Acceso:** [http://localhost:3000](http://localhost:3000)

---
<div align="center">
<i>Inspirado en centros de comando críticos. Optimizado para la claridad técnica.</i>
</div>
