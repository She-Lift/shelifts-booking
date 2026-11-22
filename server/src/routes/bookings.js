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


  server.get(`${path}/me`, async (request, response, next) => {
    try {
      const result = await pool.query(
        `SELECT *
        FROM vw_bookings
        WHERE user_id = $1
        ORDER BY workout_starts_at DESC, id DESC`,
        [request.user.id]
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
        id.length > 19 ||
        BigInt(id) > 9223372036854775807n
      ) {
        return response.status(400).json({
          message: "Invalid booking ID."
        });
      }

      const result = await pool.query(
        `SELECT *
        FROM vw_bookings
        WHERE id = $1`,
        [id]
      );

      if (result.rowCount === 0) {
        return response.status(404).json({
          message: "Booking not found."
        });
      }

      return response.status(200).json(result.rows[0]);

    } catch (error) {
      next(error);
    }
  });

}