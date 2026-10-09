# 🐕 CanisTrack GPS · Sistema de Rastreo & Navegación Satelital con Modelo 3D

> Plataforma completa de rastreo GPS en tiempo real con mapas interactivos (Modo Oscuro, Satélite e Híbrido), telemetría en vivo, geocercas circulares y un **perrito castaño claro animado en 3D (`Three.js`)** como marcador y flecha de rumbo.
> Diseñado para integrarse en aplicaciones **Next.js** en el frontend y **Fastify en Node.js** en el backend.

---

## 🚀 Características Principales

- **🐕 Marcador de Navegación con Perrito 3D**:
  - Pelaje castaño/dorado con iluminación de estudio de tres puntos.
  - Extremidades cuadrúpedas articuladas con animación de caminata/trote en tiempo real.
  - Cono direccional de navegación y haz de radar que rota dinámicamente con el rumbo angular del GPS (0° - 360°).
  - Visor 3D interactivo con rotación orbital 360°, selector de marcha (*Caminar*, *Trotar*, *Sentado*) y reacción acústica al comando *"Emitir Sonido (Beep)"*.
  - Ventana flotante PIP (*Picture-In-Picture*) con cámara 3D en vivo durante la navegación.
- **🗺️ Modos de Mapa Multi-Capa**:
  - **Modo Oscuro**: Cartografía vectorial nocturna con trazados neón de alta visibilidad.
  - **Modo Satélite**: Fotografía aérea y satelital en alta resolución (*Esri World Imagery*).
  - **Modo Híbrido**: Satélite combinado con nombres de avenidas, calles y etiquetas urbanas.
  - **Modo Calles**: Navegación urbana diurna estándar.
- **🛡️ Geocercas Circulares & Perímetros Seguros**:
  - Polígonos de alerta preconfigurados (*Zona Norte*, *Zona Sur*, *Zona Santa Fe*, *Zona Xochimilco*, *Zona Parque México*).
  - Creador interactivo de nuevas geocercas con radio personalizable en kilómetros y alertas de entrada/salida.
- **⚡ Telemetría & Simulación de Recorrido**:
  - Velocímetro analógico-digital con aguja, advertencia de exceso de velocidad (incluye unidad a 102 km/h).
  - Altitud, rumbo cardinal (ej. 80° ENE), podómetro de actividad (pasos de Max) y termómetro de collar.
  - Barra deslizante de reproducción (*scrubber*) con marcas temporales, play/pausa y multiplicador de velocidad (1x, 2x, 5x).
- **🔌 Backend Node.js & Plugin Fastify**:
  - Backend con endpoints REST y streaming SSE (*Server-Sent Events*).
  - Plugin modular de Fastify (`/server/fastify/fastifyGpsPlugin.ts`) con esquemas JSON y TypeScript estricto.
  - Envoltorio para Next.js App Router (`/src/nextjs/CanisTrackNext.tsx`) con carga dinámica segura contra errores de SSR.

---

## 📁 Estructura del Proyecto

```text
├── server.ts                       # Servidor Node.js principal (Express + Vite + API REST)
├── server/
│   └── fastify/
│       ├── fastifyGpsPlugin.ts     # Plugin oficial de Fastify listo para app.register()
│       └── fastifyServer.ts        # Servidor Fastify autónomo listo para producción
├── src/
│   ├── App.tsx                     # Orquestador principal de la interfaz GPS
│   ├── main.tsx                    # Punto de entrada Vite / React
│   ├── index.css                   # Estilos Tailwind CSS y keyframes 3D
│   ├── components/
│   │   ├── GPSMap.tsx              # Mapa interactivo Leaflet (Dark/Satellite/Hybrid)
│   │   ├── MapControls.tsx         # Brújula, zoom, selector de capas y localizador
│   │   ├── NavigationHUD.tsx       # Barra superior de navegación y selector rápido
│   │   ├── TelemetryHUD.tsx        # Velocímetro, métricas y reproductor de ruta
│   │   ├── Sidebar.tsx             # Panel lateral de dispositivos y geocercas
│   │   ├── Puppy3DViewer.tsx       # Motor Three.js del perrito en 3D interactivo
│   │   ├── Puppy3DMiniCam.tsx      # Cámara PIP 3D flotante en esquina del mapa
│   │   ├── PuppyDetailModal.tsx    # Ficha técnica 3D de Max y controles de collar
│   │   ├── AlertsModal.tsx         # Bandeja de alertas y eventos de geocercas
│   │   ├── NewGeofenceModal.tsx    # Modal para crear perímetros circulares
│   │   └── IntegrationGuideModal.tsx # Probador de API en vivo y guía de integración
│   ├── nextjs/
│   │   └── CanisTrackNext.tsx      # Componente "use client" con ssr: false para Next.js
│   ├── services/
│   │   └── gpsApiClient.ts         # SDK cliente para conectar frontend con backend
│   ├── data/
│   │   └── mockGpsData.ts          # Coordenadas de CDMX, rutas y dispositivos
│   ├── types/
│   │   ├── gps.ts                  # Interfaces TypeScript del sistema GPS
│   │   └── index.ts
│   └── utils/
│       └── markerUtils.ts          # Generador de marcadores isoméricos 3D y vehículos
├── public/                         # Recursos estáticos y ZIP descargable
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Instalación y Ejecución Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/canistrack-gps.git
cd canistrack-gps
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar en modo desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### 4. Compilar para producción
```bash
npm run build
npm start
```

---

## 🔌 Integración en tu Backend Fastify (Node.js)

En tu aplicación backend existente con Fastify:

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { fastifyGpsPlugin } from './server/fastify/fastifyGpsPlugin';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

// Registra todas las rutas GPS bajo el prefijo /api
await app.register(fastifyGpsPlugin, { prefix: '/api' });

await app.listen({ port: 4000, host: '0.0.0.0' });
```

### Endpoints REST Disponibles:
- `GET /api/health`: Estado del servicio y tiempo de actividad.
- `GET /api/devices`: Lista de unidades y ubicación actual de Max.
- `GET /api/devices/:id`: Detalle y telemetría de una unidad específica.
- `POST /api/collar/command`: Ejecuta comandos IoT en el collar (`beep`, `led_toggle`).
- `GET /api/geofences`: Lista de geocercas activas.
- `POST /api/geofences`: Registra una nueva geocerca circular.
- `GET /api/telemetry/stream`: Flujo en tiempo real mediante *Server-Sent Events (SSE)*.

---

## 💻 Integración en tu Frontend Next.js (App Router)

Crea el archivo en `app/tracking/page.tsx`:

```tsx
"use client";

import dynamic from 'next/dynamic';

// Desactivar SSR para garantizar compatibilidad con Leaflet y Three.js
const CanisTrackGPS = dynamic(() => import('@/components/CanisTrackNext'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen bg-[#0b0f17] flex items-center justify-center text-cyan-400 font-mono">
      Iniciando mapa satelital y modelo 3D...
    </div>
  ),
});

export default function TrackingPage() {
  return (
    <main className="w-screen h-screen overflow-hidden">
      <CanisTrackGPS apiUrl={process.env.NEXT_PUBLIC_FASTIFY_API_URL || 'http://localhost:4000/api'} />
    </main>
  );
}
```

---

## 📄 Licencia

MIT License © 2026 CanisTrack GPS.
