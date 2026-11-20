import health from "./routes/health.js";

export default function routesRegister(server, path) {
  health(server, path);
}
