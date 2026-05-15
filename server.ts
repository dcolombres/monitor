import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory data store for the demo
  // In a real app, this would be a database
  let monitors = [
    { id: "1", name: "CAS GDE", url: "https://cas.gde.gob.ar" },
    { id: "2", name: "Portal Nacional", url: "https://www.argentina.gob.ar" },
    { id: "3", name: "BPM DNA2", url: "https://dna2.produccion.gob.ar/dna2bpm/user/login" }
  ].map((m, i) => ({
    ...m,
    history: [] as any[],
    lastCheck: null as Date | null,
    status: "unknown" as "online" | "offline" | "unknown",
    latency: null as number | null
  }));

  // API Routes
  app.get("/api/monitors", (req, res) => {
    res.json(monitors);
  });

  app.post("/api/monitors", (req, res) => {
    const { name, url } = req.body;
    if (!name || !url) return res.status(400).json({ error: "Missing fields" });
    const newMonitor = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      url,
      history: [],
      lastCheck: null,
      status: "unknown",
      latency: null
    };
    monitors.push(newMonitor);
    res.json(newMonitor);
  });

  app.delete("/api/monitors/:id", (req, res) => {
    monitors = monitors.filter(m => m.id !== req.params.id);
    res.json({ success: true });
  });

  app.post("/api/check/:id", async (req, res) => {
    const monitor = monitors.find(m => m.id === req.params.id);
    if (!monitor) return res.status(404).json({ error: "Not found" });

    const start = Date.now();
    try {
      const response = await fetch(monitor.url, {
        method: 'GET',
        headers: { 'User-Agent': 'StatusMonitor/1.0' },
        signal: AbortSignal.timeout(10000) // 10s timeout
      });
      const end = Date.now();
      const latency = end - start;
      
      monitor.status = response.ok ? "online" : "offline";
      monitor.latency = latency;
      monitor.lastCheck = new Date();
      monitor.history.push({
        timestamp: new Date().toISOString(),
        status: monitor.status,
        latency,
        statusCode: response.status
      });
      // Keep only last 50 checks
      if (monitor.history.length > 50) monitor.history.shift();

      res.json(monitor);
    } catch (error: any) {
      const end = Date.now();
      monitor.status = "offline";
      monitor.latency = end - start;
      monitor.lastCheck = new Date();
      monitor.history.push({
        timestamp: new Date().toISOString(),
        status: "offline",
        latency: monitor.latency,
        error: error.message
      });
      if (monitor.history.length > 50) monitor.history.shift();
      res.json(monitor);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
