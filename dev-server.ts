import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";

// Import all serverless function handlers
import dsaHandler from "./api/dsa/index";
import csHandler from "./api/cs/index";
import projectsHandler from "./api/projects/index";
import mocksHandler from "./api/mocks/index";
import logsHandler from "./api/logs/index";

// Adapter: convert Express req/res to work with Vercel handlers
function vercelAdapter(handler: Function) {
  return (req: express.Request, res: express.Response) => {
    // Express v5 makes req.query read-only, so override with defineProperty
    Object.defineProperty(req, "query", {
      value: { ...req.query, ...req.params },
      writable: true,
      configurable: true,
    });
    handler(req, res);
  };
}

async function main() {
  const app = express();
  app.use(express.json());

  // Data routes
  app.all("/api/dsa", vercelAdapter(dsaHandler));
  app.all("/api/cs", vercelAdapter(csHandler));
  app.all("/api/projects", vercelAdapter(projectsHandler));
  app.all("/api/mocks", vercelAdapter(mocksHandler));
  app.all("/api/logs", vercelAdapter(logsHandler));

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
