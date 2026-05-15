## Personalizacion de GEMINI

Idioma: Español
Mi nombre: Diego

## Github

usuario de github: dcolombres

# Obsidian Flux Monitor - Proyecto de Monitoreo URL

## 📌 Descripción del Proyecto
Obsidian Flux Monitor es una aplicación de escritorio (ejecutable como aplicación web en `localhost`) inspirada en el estilo visual y funcional de Zabbix y centros de operaciones de red (NOC). Su objetivo principal es realizar *health checks* en tiempo real a un conjunto de URLs parametrizables, medir sus tiempos de respuesta, almacenar métricas para generar gráficos estadísticos comparativos y ofrecer una interfaz técnica de alto rendimiento.

---

## 🛠️ Stack Tecnológico
*   **Frontend:** React 19 + Vite + Tailwind CSS 4.
*   **Backend / Proxy:** Express.js (actúa como proxy para evitar restricciones de CORS y medir latencia real desde el servidor).
*   **Visualización de Datos:** Recharts (basado en D3).
*   **Animaciones:** Motion.
*   **Estilo Visual:** "Sophisticated Dark" / "Obsidian Flux" (Glassmorphism, tipografía técnica tipo *JetBrains Mono*, estética premium de centro de comando).

---

## ⚙️ Reglas de Negocio y Funcionalidades Core

### 1. Sistema de Monitoreo & Health Check
*   **Métricas capturadas:** Estado HTTP (ej. 200 OK, 404, 500), disponibilidad (Online/Offline), tiempo de acceso/latencia (en milisegundos).
*   **Frecuencia de refresco:** Cuenta regresiva automática de **120 segundos** con una barra de progreso visual. Al llegar a 0, se sincronizan y actualizan todos los monitores.
*   **URLs de prueba preconfiguradas:**
    *   CAS GDE (`https://cas.gde.gob.ar`)
    *   Portal Nacional (`https://www.argentina.gob.ar`)
    *   BPM DNA2 (`https://dna2.produccion.gob.ar/dna2bpm/user/login`)

### 2. Estructura de la Interfaz (Vistas)
La aplicación cuenta con una barra lateral (*Sidebar*) para navegar entre las siguientes secciones:

*   **Dashboard (Mosaico Vivo):** 
    *   Muestra tarjetas informativas de cada URL.
    *   Cada tarjeta incluye: Nombre, URL, estado (200 OK con indicador pulso verde o crítico en rojo), tiempo de respuesta actual y un mini-gráfico de tendencia de latencia.
    *   **Restricción de paginación:** Máximo **16 sitios por pantalla/grupo**. Si se superan los 16, se genera automáticamente otro grupo de 16 con slots vacíos visuales si es necesario para mantener la simetría de la cuadrícula.
*   **Panel de Analíticas y Resumen:**
    *   **Distribución de Disponibilidad:** Gráfico circular (Donut/Pie) con la relación global de sitios Online vs. Offline.
    *   **Ranking de Tiempos:** Gráfico de barras comparativo para identificar rápidamente los sitios más rápidos y más lentos.
    *   **Historial de Latencia:** Gráfico de área para visualizar picos de respuesta a lo largo del tiempo.
*   **Sección de Administración (Admin):**
    *   Formulario técnico y compacto para añadir nuevas URLs (Campos: Nombre y URL).
    *   Listado para configurar, editar o eliminar los sitios existentes de la red de monitoreo.

---

## 🎨 Lineamientos de Diseño (Theme: Sophisticated Dark)
La interfaz debe respetar estrictamente la siguiente paleta de colores y estilos para mantener la estética NOC:

*   **Background Principal:** `#0A0B0E` (Obsidian profundo)
*   **Paneles y Tarjetas (Surface):** `#12141A` (Gris oscuro técnico con sutiles bordes acentuados y efectos de desenfoque de cristal).
*   **Estados (Accents):**
    *   `#10B981` (Esmeralda) -> Estados positivos / Online (200 OK).
    *   `#F43F5E` (Rosa/Rojo) -> Errores críticos / Offline.
    *   `#F59E0B` (Ámbar) -> Advertencias / Latencia alta.
*   **Tipografía:** Estilo limpio con textos en mayúsculas (*uppercase*) y espaciado expandido (*tracked-out*) para datos numéricos y encabezados, asimilando consolas de comandos.

---

## 📂 Archivos Clave del Proyecto
El core de la aplicación se distribuye en los siguientes archivos modificados en la última compilación estable:
*   `server.ts` (Configuración de Express y lógica del Proxy de peticiones).
*   `src/App.tsx` (Componente principal, ruteo interno, manejo de estado global de las URLs y layouts de las vistas).
*   `src/index.css` (Configuración de estilos globales y variables de Tailwind v4).
*   `src/types.ts` & `src/lib/utils.ts` (Tipados del monitor y funciones utilitarias).
*   `package.json` & `metadata.json` (Dependencias e información del entorno).
