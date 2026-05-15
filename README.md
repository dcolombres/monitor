<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🛡️ Obsidian Flux Monitor (MONITOR)

**MONITOR** es una aplicación de alto rendimiento inspirada en el estilo visual y funcional de Zabbix y los centros de operaciones de red (**NOC**). Su objetivo principal es realizar *health checks* en tiempo real a un conjunto de URLs parametrizables, medir sus tiempos de respuesta y ofrecer una interfaz técnica de estética premium.

---

## 📌 Descripción del Proyecto

Monitor es una aplicación de escritorio (ejecutable como aplicación web en `localhost`) diseñada para ofrecer visibilidad crítica. Permite monitorear la disponibilidad de servicios, almacenar métricas para generar gráficos estadísticos comparativos y ofrecer una interfaz técnica de alto rendimiento con una estética "Sophisticated Dark".

---

## ✨ Funcionalidades Core & Reglas de Negocio

### 1. Sistema de Monitoreo & Health Check
*   **Métricas capturadas:** Estado HTTP (ej. 200 OK, 404, 500), disponibilidad (Online/Offline) y latencia (ms).
*   **Frecuencia de refresco:** Cuenta regresiva automática de **120 segundos** con barra de progreso visual. Al llegar a 0, se sincronizan y actualizan todos los monitores.
*   **Sparklines de Tendencia:** Cada monitor incluye un mini-gráfico de área que muestra el historial reciente de latencia.

### 2. Estructura de la Interfaz (Vistas)
*   **Dashboard (Mosaico Vivo):** 
    *   Tarjetas informativas con nombre, URL, estado (pulso visual), tiempo de respuesta y tendencia.
    *   **Restricción de paginación:** Máximo **16 sitios por pantalla**. Slots vacíos visuales para mantener la simetría de la cuadrícula.
*   **Panel de Analíticas:**
    *   **Distribución de Disponibilidad:** Gráfico circular (Donut) Online vs. Offline.
    *   **Ranking de Tiempos:** Comparativa de los sitios más rápidos y lentos.
    *   **Historial de Latencia:** Gráfico de área global para visualizar picos de respuesta.
*   **Administración (Admin):**
    *   Formulario técnico para añadir/editar URLs.
    *   Listado de gestión de la red de monitoreo.

---

## 🎨 Lineamientos de Diseño (Obsidian Flux)

La interfaz respeta estrictamente la paleta de colores y estilos NOC:

*   **Background:** `#0A0B0E` (Obsidian profundo)
*   **Superficies:** `#12141A` (Gris oscuro técnico con Glassmorphism).
*   **Estados (Accents):**
    *   `#10B981` (Esmeralda) -> Online / 200 OK.
    *   `#F43F5E` (Rosa/Rojo) -> Offline / Errores.
    *   `#F59E0B` (Ámbar) -> Latencia alta.
*   **Tipografía:** **JetBrains Mono** (estilo consola) con textos en mayúsculas y espaciado expandido.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19 + Vite + Tailwind CSS 4.
- **Backend / Proxy:** Express.js (actúa como proxy para evitar restricciones de CORS).
- **Visualización:** Recharts (basado en D3).
- **Animaciones:** Motion.

---

## 🚀 Instalación y Uso Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) (v18.0.0 o superior)

### Pasos
1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar Entorno:**
   Crea un archivo `.env.local` basado en el `.env.example`:
   ```bash
   GEMINI_API_KEY=tu_api_key
   ```

3. **Ejecutar en Desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en: [http://localhost:3000](http://localhost:3000)

---
<div align="center">
Desarrollado con precisión para el monitoreo de infraestructura crítica.
</div>
