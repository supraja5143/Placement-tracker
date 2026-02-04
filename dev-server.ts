import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";

import handler from "./api/index";

function vercelAdapter(handler: Function) {
  return (req: express.Request, res: express.Response) => {
    // Extract route from URL path (e.g., /api/dsa -> dsa)
    const route = req.path.replace(/^\/api\/?/, "");
    Object.defineProperty(req, "query", {
      value: { ...req.query, ...req.params, __route: route },
      writable: true,
      configurable: true,
    });
    handler(req, res);
  };
}

async function main() {
  const app = express();
  app.use(express.json());

  // Single handler for all API routes
  app.all("/api/*", vercelAdapter(handler));
  app.all("/api", vercelAdapter(handler));

  // Vite dev server for frontend
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Dev server running at http://localhost:${PORT}`);
  });
}

main().catch(console.error);
