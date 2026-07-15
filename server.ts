import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route - Retrieve secure configurations from backend environment safely
  app.get("/api/config", (req, res) => {
    res.json({
      stadiumOpsApiKey: process.env.STADIUM_OPS_API_KEY || "sk_stadiumops_pro_live_8d7a12b6fd599812",
      iotHubApiKey: process.env.IOT_HUB_API_KEY || "key_iot_mesh_w_3289ab72c91a01",
      posTerminalApiKey: process.env.POS_TERMINAL_API_KEY || "key_pos_hub_vendor_8f11074da",
      stadiumId: process.env.STADIUM_ID || "stadium_stg_coliseum_99b",
      iotHubId: process.env.IOT_HUB_ID || "hub_mesh_west_gate_c",
      posTerminalId: process.env.POS_TERMINAL_ID || "pos_alpha_vendor_42",
      cctvStreamId: process.env.CCTV_STREAM_ID || "stream_unified_concourse_112",
      appUrl: process.env.APP_URL || ""
    });
  });

  // API Route - Health Check for platform deployment ingress verification
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development or Static Assets for Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
