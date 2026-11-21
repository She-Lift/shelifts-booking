import health from "./routes/health.js";
import users from "./routes/users.js";

export default function routesRegister(server, path) {
  health(server, path);
  users(server, path);
}
