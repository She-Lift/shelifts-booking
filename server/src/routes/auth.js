
import pool from "../db/pool.js";
import { verifyPassword } from "../utils/password.js";

export default function auth(server, path) {
  path += "/auth";

  server.get(path, (request, response) => {
    return response.status(200).json({
      user: request.user
    });
  });

  server.post(`${path}`, async (request, response, next) => {
    try {
      const { username, password } = request.body;
      const normalizedUsername = username.trim();

      if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        normalizedUsername.length < 3 ||
        password.length < 10
      ) {
        return response.status(400).json({
          message: "Invalid request data."
        });
      }

      const result = await pool.query(
        `SELECT id, username, password_hash, role,
                is_active, must_change_password
        FROM users
        WHERE username = $1`,
        [username.trim()]
      );

      const user = result.rows[0];

      if (!user || !user.is_active) {
        return response.status(401).json({
          message: "Invalid username or password."
        });
      }

      const validPassword = await verifyPassword(
        password,
        user.password_hash
      );

      if (!validPassword) {
        return response.status(401).json({
          message: "Invalid username or password."
        });
      }

      // Generate a new session ID after authentication
      request.session.regenerate((error) => {
        if (error) {
          return next(error);
        }

        request.session.userId = user.id;

        request.session.save((error) => {
          if (error) {
            return next(error);
          }

          return response.status(200).json({
            message: "Successfully logged in.",
            user: {
              id: user.id,
              username: user.username,
              role: user.role,
              mustChangePassword: user.must_change_password
            }
          });
        });
      });

    } catch (error) {
      next(error);
    }
  });

  server.delete(path, (request, response, next) => {
    request.session.destroy((error) => {
      if (error) {
        return next(error);
      }

      response.clearCookie("connect.sid");

      return response.status(204).end();
    });
  });
}
