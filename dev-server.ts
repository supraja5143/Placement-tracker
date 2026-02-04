import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";

// Import all serverless function handlers
import loginHandler from "./api/login";
import registerHandler from "./api/register";
import logoutHandler from "./api/logout";
import userHandler from "./api/user";
import dsaIndexHandler from "./api/dsa/index";
import dsaIdHandler from "./api/dsa/[id]";
import csIndexHandler from "./api/cs/index";
import csIdHandler from "./api/cs/[id]";
import projectsIndexHandler from "./api/projects/index";
import projectsIdHandler from "./api/projects/[id]";
import mocksIndexHandler from "./api/mocks/index";
import mocksIdHandler from "./api/mocks/[id]";
import logsIndexHandler from "./api/logs/index";

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

  // Auth routes
  app.all("/api/login", vercelAdapter(loginHandler));
  app.all("/api/register", vercelAdapter(registerHandler));
  app.all("/api/logout", vercelAdapter(logoutHandler));
  app.all("/api/user", vercelAdapter(userHandler));

  // Data routes
  app.all("/api/dsa", vercelAdapter(dsaIndexHandler));
  app.all("/api/dsa/:id", vercelAdapter(dsaIdHandler));
  app.all("/api/cs", vercelAdapter(csIndexHandler));
  app.all("/api/cs/:id", vercelAdapter(csIdHandler));
  app.all("/api/projects", vercelAdapter(projectsIndexHandler));
  app.all("/api/projects/:id", vercelAdapter(projectsIdHandler));
  app.all("/api/mocks", vercelAdapter(mocksIndexHandler));
  app.all("/api/mocks/:id", vercelAdapter(mocksIdHandler));
  app.all("/api/logs", vercelAdapter(logsIndexHandler));

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
