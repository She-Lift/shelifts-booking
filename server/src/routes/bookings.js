import pool from "../db/pool.js";

export default function bookings(server, path) {
  path += "/bookings";

  server.get(path, async (request, response, next) => {
    try {
      const result = await pool.query(
        `SELECT *
        FROM vw_bookings
        ORDER BY created_at DESC, id DESC`
      );

      return response.status(200).json(result.rows);

    } catch (error) {
      next(error);
    }
  });
}