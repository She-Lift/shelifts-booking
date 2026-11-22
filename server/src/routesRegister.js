import health from "./routes/health.js";
import auth from "./routes/auth.js";
import users from "./routes/users.js";
import punchCards from "./routes/punchCards.js";
import workouts from "./routes/workouts.js";

export default function routesRegister(server, path) {
  health(server, path);
  auth(server, path);
  users(server, path);
  punchCards(server, path);
  workouts(server, path);
}
