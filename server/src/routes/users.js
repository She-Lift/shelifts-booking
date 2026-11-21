import pool from "../db/pool.js";
import { hashPassword } from "../utils/password.js";

export default function users(server, path) {
  path += "/users";

  server.post(path, async (request, response) => {
    try {
      const { username, password } = request.body;

      if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        username.length < 3 ||
        password.length < 10) {
        return response.status(400).json({
          message: "Invalid username or password."
        });
      }

      const normalizedUsername = username.trim();
      const passwordHash = await hashPassword(password);

      await pool.query(
        `INSERT INTO users (username, password_hash)
        VALUES ($1, $2)
        RETURNING id, username, role, is_active, created_at`,
        [normalizedUsername, passwordHash]
      );

      return response.status(201).json({
        message: "User created successfully."
      });

    } catch (error) {
      console.log(error);

      return response.status(500).json({
        message: "Server error."
      });
    }
  });
}
