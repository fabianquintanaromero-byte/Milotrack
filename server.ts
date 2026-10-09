import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// Mock in-memory state for devices & geofences (compatible with both Express and Fastify)
const mockDevices = [
  {
    id: 'entity-puppy-max',
    name: 'Max (Perrito Castaño Claro)',
    type: 'pet',
    subType: 'Golden Retriever Pup',
    tag: 'DOG-GPS-99',
    color: '#f59e0b',
    glowColor: '#38bdf8',
    currentPosition: { lat: 19.3510, lng: -99.1620 },
    heading: 80,
    speed: 15,
    speedLimit: 30,
    maxSpeedToday: 42,
    avgSpeedToday: 18.4,
    distanceTodayKm: 14.2,
    battery: 92,
    batteryState: 'normal',
    status: 'moving',
    statusLabel: 'Paseo Activo · En Movimiento',
    altitude: 2245,
    satellites: 16,
    accuracyMeters: 1.1,
    temperature: 24.2,
    stepsToday: 9480,
    currentGeofence: 'Cerca de Zona Sur (Coyoacán)',
    collarSerial: 'PAWPOINT-PRO-V2',
    assignedDriverOrOwner: 'Fabian Quintana (Tutor)',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'entity-truck-402',
    name: 'Camión Carga Norte #402',
    type: 'truck',
    subType: 'Kenworth T680 Trailer',
    tag: 'TRUCK-CDMX-402',
    color: '#0284c7',
    glowColor: '#38bdf8',
    currentPosition: { lat: 19.4680, lng: -99.1390 },
    heading: 205,
    speed: 64,
    speedLimit: 80,
    maxSpeedToday: 88,
    avgSpeedToday: 54.1,
    distanceTodayKm: 128.5,
    battery: 98,
    batteryState: 'charging',
    status: 'moving',
    statusLabel: 'En Ruta Logística',
    altitude: 2250,
    satellites: 14,
    accuracyMeters: 1.8,
    lastUpdated: new Date().toISOString(),
    assignedDriverOrOwner: 'Operador Gómez · Logística Troncal',
  },
  {
    id: 'entity-pickup-108',
    name: 'Pickup Logística Poniente #108',
    type: 'car',
    subType: 'Toyota Hilux 4x4',
    tag: 'LOG-PK-108',
    color: '#16a34a',
    glowColor: '#4ade80',
    currentPosition: { lat: 19.3950, lng: -99.1920 },
    heading: 80,
    speed: 48,
    speedLimit: 70,
    maxSpeedToday: 76,
    avgSpeedToday: 41.2,
    distanceTodayKm: 64.8,
    battery: 84,
    batteryState: 'normal',
    status: 'moving',
    statusLabel: 'Operación Poniente',
    altitude: 2310,
    satellites: 15,
    accuracyMeters: 1.4,
    lastUpdated: new Date().toISOString(),
    assignedDriverOrOwner: 'Carlos R. · Distribución',
  },
  {
    id: 'entity-alert-03',
    name: 'Unidad Tlalpan #03 (Exceso Vel.)',
    type: 'van',
    subType: 'Mercedes Sprinter Carga',
    tag: 'ALRT-VAN-03',
    color: '#ef4444',
    glowColor: '#f87171',
    currentPosition: { lat: 19.3410, lng: -99.1550 },
    heading: 165,
    speed: 102,
    speedLimit: 80,
    maxSpeedToday: 106,
    avgSpeedToday: 72.0,
    distanceTodayKm: 92.4,
    battery: 76,
    batteryState: 'normal',
    status: 'geofence_alert',
    statusLabel: '¡Alerta de Velocidad: 102 km/h!',
    altitude: 2235,
    satellites: 13,
    accuracyMeters: 2.1,
    lastUpdated: new Date().toISOString(),
    assignedDriverOrOwner: 'Unidad Externa Subcontratada',
  },
];

let mockGeofences = [
  {
    id: 'geo-norte',
    name: 'Zona Norte',
    center: { lat: 19.4850, lng: -99.1280 },
    radiusMeters: 4200,
    color: '#06b6d4',
    borderStyle: 'dashed',
    iconType: 'warehouse',
    active: true,
    alertOnExit: true,
    alertOnEntry: true,
  },
  {
    id: 'geo-sur',
    name: 'Zona Sur',
    center: { lat: 19.3240, lng: -99.1860 },
    radiusMeters: 3800,
    color: '#f97316',
    borderStyle: 'dashed',
    iconType: 'fence',
    active: true,
    alertOnExit: true,
    alertOnEntry: false,
  },
  {
    id: 'geo-santafe',
    name: 'Zona Santa Fe',
    center: { lat: 19.3620, lng: -99.2590 },
    radiusMeters: 3600,
    color: '#10b981',
    borderStyle: 'solid',
    iconType: 'fence',
    active: true,
    alertOnExit: false,
    alertOnEntry: true,
  },
  {
    id: 'geo-parquemexico',
    name: 'Zona Parque México (Perímetro Seguro)',
    center: { lat: 19.4124, lng: -99.1687 },
    radiusMeters: 1400,
    color: '#eab308',
    borderStyle: 'dashed',
    iconType: 'park',
    active: true,
    alertOnExit: true,
    alertOnEntry: false,
  },
];

let mockAlerts = [
  {
    id: 'alt-1',
    entityId: 'entity-alert-03',
    entityName: 'Unidad Tlalpan #03',
    type: 'speed_limit',
    title: 'Exceso de Velocidad Crítico',
    description: 'La unidad superó el límite fijado (80 km/h) registrando 102 km/h en Calzada de Tlalpan / Ermita.',
    timestamp: new Date().toISOString(),
    severity: 'critical',
    read: false,
    coordinates: { lat: 19.3410, lng: -99.1550 },
  },
  {
    id: 'alt-2',
    entityId: 'entity-puppy-max',
    entityName: 'Max (Perrito Castaño Claro)',
    type: 'geofence_exit',
    title: 'Salida de Zona Segura Parque',
    description: 'Max cruzó el límite del perímetro de Parque México hacia Av. Insurgentes Sur.',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    severity: 'warning',
    read: false,
    coordinates: { lat: 19.3920, lng: -99.1710 },
  },
];

async function startServer() {
  const app = express();

  app.use(express.json());

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // --- REST API ENDPOINTS (Node.js & Fastify compatible) ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CanisTrack GPS Backend',
      version: '2.4.0',
      nodeVersion: process.version,
      architecture: 'Fastify & Next.js ready',
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Get all devices / entities
  app.get('/api/devices', (req, res) => {
    res.json({
      total: mockDevices.length,
      devices: mockDevices,
    });
  });

  // Get single device
  app.get('/api/devices/:id', (req, res) => {
    const device = mockDevices.find((d) => d.id === req.params.id);
    if (!device) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }
    res.json(device);
  });

  // Get device telemetry
  app.get('/api/devices/:id/telemetry', (req, res) => {
    const device = mockDevices.find((d) => d.id === req.params.id);
    if (!device) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }
    res.json({
      deviceId: device.id,
      position: device.currentPosition,
      heading: device.heading,
      speedKmH: device.speed,
      altitudeMeters: device.altitude,
      batteryPercent: device.battery,
      satellites: device.satellites,
      accuracyMeters: device.accuracyMeters,
      stepsToday: (device as any).stepsToday,
      temperatureC: (device as any).temperature,
      timestamp: new Date().toISOString(),
    });
  });

  // Execute collar command (Beep buzzer, LED toggle, etc.)
  app.post('/api/collar/command', (req, res) => {
    const { deviceId, command, value } = req.body || {};
    const device = mockDevices.find((d) => d.id === deviceId);

    if (!device) {
      res.status(404).json({ error: 'Device not found' });
      return;
    }

    res.json({
      success: true,
      deviceId,
      command,
      value,
      status: 'executed',
      acknowledgedAt: new Date().toISOString(),
      collarResponse: `Collar ${device.tag} received ${command}`,
    });
  });

  // Geofences endpoints
  app.get('/api/geofences', (req, res) => {
    res.json({
      total: mockGeofences.length,
      geofences: mockGeofences,
    });
  });

  app.post('/api/geofences', (req, res) => {
    const newZone = req.body;
    if (!newZone || !newZone.name || !newZone.center) {
      res.status(400).json({ error: 'Invalid geofence payload' });
      return;
    }
    const created = {
      id: newZone.id || `geo-${Date.now()}`,
      active: true,
      ...newZone,
    };
    mockGeofences.push(created);
    res.status(201).json({ success: true, geofence: created });
  });

  // Alerts endpoints
  app.get('/api/alerts', (req, res) => {
    res.json({
      total: mockAlerts.length,
      unread: mockAlerts.filter((a) => !a.read).length,
      alerts: mockAlerts,
    });
  });

  app.post('/api/alerts/:id/read', (req, res) => {
    const alert = mockAlerts.find((a) => a.id === req.params.id);
    if (alert) alert.read = true;
    res.json({ success: true, alertId: req.params.id });
  });

  // Server-Sent Events (SSE) live telemetry stream
  app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const interval = setInterval(() => {
      // Simulate slight puppy movement
      const puppy = mockDevices[0];
      const data = JSON.stringify({
        deviceId: puppy.id,
        lat: puppy.currentPosition.lat,
        lng: puppy.currentPosition.lng,
        heading: puppy.heading,
        speed: puppy.speed,
        timestamp: new Date().toISOString(),
      });
      res.write(`data: ${data}\n\n`);
    }, 2000);

    req.on('close', () => {
      clearInterval(interval);
    });
  });

  // Download complete project ZIP for GitHub
  app.get('/api/download-zip', (req, res) => {
    const zipPath = path.join(__dirname, 'public', 'canistrack-gps.zip');
    res.download(zipPath, 'canistrack-gps-github.zip', (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({ error: 'Could not deliver zip file', details: String(err) });
      }
    });
  });

  // Vite middleware in dev or static files in production
  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CanisTrack Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[CanisTrack Server] Failed to start:', err);
  process.exit(1);
});
