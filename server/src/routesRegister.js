import health from "./routes/health.js";
import auth from "./routes/auth.js";

export default function routesRegister(server, path) {
  health(server, path);
  auth(server, path);
}
