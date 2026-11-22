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

  server.post(path, async (request, response, next) => {
    try {
      const { workoutId, punchCardId } = request.body;

      const isValidId = (id) =>
        Number.isSafeInteger(id) && id > 0;

      if (!isValidId(workoutId)) {
        return response.status(400).json({
          message: "Invalid workout ID."
        });
      }

      if (!isValidId(punchCardId)) {
        return response.status(400).json({
          message: "Invalid punch card ID."
        });
      }

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        // Lock workout before checking availability
        const workoutResult = await client.query(
          `SELECT id, starts_at, capacity, status
          FROM workout_sessions
          WHERE id = $1
          FOR UPDATE`,
          [workoutId]
        );

        if (workoutResult.rowCount === 0) {
          await client.query("ROLLBACK");

          return response.status(404).json({
            message: "Workout not found."
          });
        }

        const workout = workoutResult.rows[0];

        if (workout.status !== "scheduled") {
          await client.query("ROLLBACK");

          return response.status(409).json({
            message: "Workout is not available for booking."
          });
        }

        // Use database time for the start-time check
        const timeResult = await client.query(
          `SELECT $1::timestamptz > NOW() AS can_book`,
          [workout.starts_at]
        );

        if (!timeResult.rows[0].can_book) {
          await client.query("ROLLBACK");

          return response.status(409).json({
            message: "Workout has already started."
          });
        }

        // Prevent duplicate active bookings
        const existingResult = await client.query(
          `SELECT id
          FROM bookings
          WHERE user_id = $1
            AND workout_session_id = $2
            AND status IN ('booked', 'completed')
          LIMIT 1`,
          [request.user.id, workoutId]
        );

        if (existingResult.rowCount > 0) {
          await client.query("ROLLBACK");

          return response.status(409).json({
            message: "You have already booked this workout."
          });
        }

        // Check available capacity
        const capacityResult = await client.query(
          `SELECT COUNT(*)::integer AS booked_slots
          FROM bookings
          WHERE workout_session_id = $1
            AND status IN ('booked', 'completed')`,
          [workoutId]
        );

        if (
          capacityResult.rows[0].booked_slots >= workout.capacity
        ) {
          await client.query("ROLLBACK");

          return response.status(409).json({
            message: "Workout is fully booked."
          });
        }

        // Lock selected punch card and verify ownership
        const cardResult = await client.query(
          `SELECT
            id,
            remaining_credits,
            max_sessions_per_week,
            status,
            (
              ($2::timestamptz AT TIME ZONE 'Europe/Stockholm')::date
              BETWEEN valid_from AND valid_until
            ) AS valid_on_workout_date
          FROM user_punch_cards
          WHERE id = $1
            AND user_id = $3
          FOR UPDATE`,
          [
            punchCardId,
            workout.starts_at,
            request.user.id
          ]
        );

        if (cardResult.rowCount === 0) {
          await client.query("ROLLBACK");

          return response.status(404).json({
            message: "Punch card not found."
          });
        }

        const card = cardResult.rows[0];

        if (card.status !== "active") {
          await client.query("ROLLBACK");

          return response.status(409).json({
            message: "Punch card is revoked."
          });
        }

        if (!card.valid_on_workout_date) {
          await client.query("ROLLBACK");

          return response.status(409).json({
            message: "Punch card is not valid for this workout."
          });
        }

        if (card.remaining_credits < 1) {
          await client.query("ROLLBACK");

          return response.status(409).json({
            message: "Punch card has no remaining credits."
          });
        }

        // Check weekly limit for this punch card
        if (card.max_sessions_per_week !== null) {
          const weeklyResult = await client.query(
            `SELECT COUNT(*)::integer AS weekly_bookings
            FROM bookings b
            INNER JOIN workout_sessions ws
              ON b.workout_session_id = ws.id
            WHERE b.user_punch_card_id = $1
              AND b.status IN ('booked', 'completed')
              AND date_trunc(
                'week',
                ws.starts_at AT TIME ZONE 'Europe/Stockholm'
              ) = date_trunc(
                'week',
                $2::timestamptz AT TIME ZONE 'Europe/Stockholm'
              )`,
            [punchCardId, workout.starts_at]
          );

          if (
            weeklyResult.rows[0].weekly_bookings >=
            card.max_sessions_per_week
          ) {
            await client.query("ROLLBACK");

            return response.status(409).json({
              message: "Weekly session limit reached."
            });
          }
        }

        // Create booking
        const bookingResult = await client.query(
          `INSERT INTO bookings (
            user_id,
            workout_session_id,
            user_punch_card_id
          )
          VALUES ($1, $2, $3)
          RETURNING id`,
          [
            request.user.id,
            workoutId,
            punchCardId
          ]
        );

        const bookingId = bookingResult.rows[0].id;

        // Deduct one credit
        const creditResult = await client.query(
          `UPDATE user_punch_cards
          SET remaining_credits = remaining_credits - 1
          WHERE id = $1
            AND remaining_credits > 0`,
          [punchCardId]
        );

        if (creditResult.rowCount !== 1) {
          throw new Error("Unable to deduct booking credit.");
        }

        // Register the credit deduction
        await client.query(
          `INSERT INTO credit_transactions (
            user_punch_card_id,
            booking_id,
            amount,
            reason,
            performed_by
          )
          VALUES ($1, $2, -1, 'booking', $3)`,
          [
            punchCardId,
            bookingId,
            request.user.id
          ]
        );

        await client.query("COMMIT");

        return response.status(201).json({
          message: "Workout booked successfully.",
          bookingId
        });

      } catch (error) {
        await client.query("ROLLBACK");

        if (
          error.code === "23505" &&
          error.constraint === "ux_active_booking"
        ) {
          return response.status(409).json({
            message: "You have already booked this workout."
          });
        }

        throw error;

      } finally {
        client.release();
      }

    } catch (error) {
      next(error);
    }
  });

}