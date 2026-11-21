import pool from "../db/pool.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

export default function users(server, path) {
  path += "/users";

  server.get(path, async (request, response, next) => {
    try {
      const result = await pool.query(
        `SELECT id,
          username,
          role,
          is_active,
          must_change_password,
          created_at
        FROM users
        WHERE role = 'customer'
        ORDER BY username ASC`
      );

      return response.status(200).json(result.rows);

    } catch (error) {
      next(error);
    }
  });

  server.get(`${path}/:id`, async (request, response, next) => {
    try {
      const { id } = request.params;

      if (
        !/^[1-9]\d*$/.test(id) ||
        !Number.isSafeInteger(Number(id))
      ) {
        return response.status(400).json({
          message: "Invalid user ID."
        });
      }

      const result = await pool.query(
        `SELECT id,
          username,
          role,
          is_active,
          must_change_password,
          created_at
        FROM users
        WHERE id = $1
        AND role = 'customer'`,
        [id]
      );

      if (result.rowCount === 0) {
        return response.status(404).json({
          message: "Customer not found."
        });
      }

      return response.status(200).json(result.rows[0]);

    } catch (error) {
      next(error);
    }
  });

  server.post(path, async (request, response) => {
    try {
      const { username, password } = request.body;
      const normalizedUsername = username.trim();

      if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        normalizedUsername.length < 3 ||
        password.length < 10) {
        return response.status(400).json({
          message: "Invalid username or password."
        });
      }

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

  server.patch(`${path}/me/password`, async (request, response, next) => {
    try {
      const { currentPassword, newPassword } = request.body ?? {};

      if (
        typeof currentPassword !== "string" ||
        typeof newPassword !== "string" ||
        currentPassword.length === 0 ||
        Buffer.byteLength(currentPassword, "utf8") > 128 ||
        newPassword.length < 10 ||
        Buffer.byteLength(newPassword, "utf8") > 128
      ) {
        return response.status(400).json({
          message: "Invalid password data."
        });
      }

      if (currentPassword === newPassword) {
        return response.status(400).json({
          message: "New password must be different from current password."
        });
      }

      const result = await pool.query(
        `SELECT password_hash
        FROM users
        WHERE id = $1 AND is_active = true`,
        [request.user.id]
      );

      const user = result.rows[0];

      if (!user) {
        return response.status(401).json({
          message: "Authentication required."
        });
      }

      const validPassword = await verifyPassword(
        currentPassword,
        user.password_hash
      );

      if (!validPassword) {
        return response.status(403).json({
          message: "Current password is incorrect."
        });
      }

      const passwordHash = await hashPassword(newPassword);

      const updateResult = await pool.query(
        `UPDATE users
        SET password_hash = $1,
        must_change_password = false
        WHERE id = $2
        AND password_hash = $3
        AND is_active = true`,
        [passwordHash, request.user.id, user.password_hash]
      );

      if (updateResult.rowCount === 0) {
        return response.status(409).json({
          message: "Account has changed. Please try again."
        });
      }

      return response.status(204).end();

    } catch (error) {
      next(error);
    }
  });

  server.patch(`${path}/:id/password`, async (request, response, next) => {
    try {
      const { id } = request.params;
      const { newPassword } = request.body ?? {};

      if (
        !/^[1-9]\d*$/.test(id) ||
        !Number.isSafeInteger(Number(id))
      ) {
        return response.status(400).json({
          message: "Invalid user ID."
        });
      }

      if (
        typeof newPassword !== "string" ||
        newPassword.length < 10 ||
        Buffer.byteLength(newPassword, "utf8") > 128
      ) {
        return response.status(400).json({
          message: "Invalid password."
        });
      }

      if (Number(id) === Number(request.user.id)) {
        return response.status(403).json({
          message: "You cannot reset your own password."
        });
      }

      const passwordHash = await hashPassword(newPassword);

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        const result = await client.query(
          `UPDATE users
          SET password_hash = $1,
          must_change_password = true
          WHERE id = $2
          AND role = 'customer'`,
          [passwordHash, id]
        );

        if (result.rowCount === 0) {
          await client.query("ROLLBACK");

          return response.status(404).json({
            message: "Customer not found."
          });
        }

        await client.query(
          `DELETE FROM user_sessions
          WHERE sess ->> 'userId' = $1`,
          [id]
        );

        await client.query("COMMIT");

        return response.status(204).end();

      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      next(error);
    }
  });

}