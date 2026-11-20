import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sessionMiddleware from "./middleware/session.js";
import authorize from "./middleware/authorize.js";
import routesRegister from "./routesRegister.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import pool from "./db/pool.js";

const server = express();
const PORT = Number(process.env.PORT ?? 3000);
const serverPath = "/api";

const publicDir = fileURLToPath(
  new URL("../public/", import.meta.url)
);

server.disable("x-powered-by");

if (process.env.NODE_ENV === "production") {
  server.set("trust proxy", 1);
}

server.use(express.json());
server.use(sessionMiddleware); // Session middleware
server.use(serverPath, authorize); // ACL applies to all API requests.

routesRegister(server, serverPath); // Register API routes

// Serve React if a production build exists
if (existsSync(path.join(publicDir, "index.html"))) {
  server.use(express.static(publicDir));

  server.get("/{*splat}", (request, response) => {
    response.sendFile(path.join(publicDir, "index.html"));
  });

  console.log("React production build detected.");
}

server.use(notFound); // Handle unknown endpoints
server.use(errorHandler); // Handle application errors

async function startServer() {
  try {
    await pool.query("SELECT 1");

    console.log("PostgreSQL connected successfully.");

    server.listen(PORT, () => {
      console.log(`SHE LIFTS API running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    process.exitCode = 1;
    await pool.end();
  }
}

await startServer();