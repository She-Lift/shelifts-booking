
import pool from "../db/pool.js";

export default async function authenticate(request, response, next) {
  try {
    const userId = request.session?.userId;

    if (!userId) {
      return response.status(401).json({
        message: "Authentication required."
      });
    }

    const result = await pool.query(
      `SELECT id, username, role, is_active, must_change_password
       FROM users
       WHERE id = $1`,
      [userId]
    );

    const user = result.rows[0];

    if (!user || !user.is_active) {
      return response.status(401).json({
        message: "Authentication required."
      });
    }

    request.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      mustChangePassword: user.must_change_password
    };

    next();
  } catch (error) {
    next(error);
  }
}
