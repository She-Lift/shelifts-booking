import pool from "../db/pool.js";

export default function workouts(server, path) {
  path += "/workouts";

  server.get(path, async (request, response, next) => {
    try {
      const result = await pool.query(
        `SELECT *
        FROM vw_workouts
        ORDER BY starts_at ASC, id ASC`
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
          message: "Invalid workout ID."
        });
      }

      const result = await pool.query(
        `SELECT *
        FROM vw_workouts
        WHERE id = $1`,
        [id]
      );

      if (result.rowCount === 0) {
        return response.status(404).json({
          message: "Workout not found."
        });
      }

      return response.status(200).json(result.rows[0]);

    } catch (error) {
      next(error);
    }
  });

  server.post(path, async (request, response, next) => {
    try {
      const {
        title,
        description = null,
        startsAt,
        endsAt,
        capacity
      } = request.body;

      const normalizedTitle =
        typeof title === "string" ? title.trim() : "";

      if (
        normalizedTitle.length === 0 ||
        normalizedTitle.length > 150
      ) {
        return response.status(400).json({
          message: "Invalid workout session title."
        });
      }

      if (
        description !== null &&
        typeof description !== "string"
      ) {
        return response.status(400).json({
          message: "Invalid workout session description."
        });
      }

      if (
        !Number.isInteger(capacity) ||
        capacity < 1 ||
        capacity > 2147483647
      ) {
        return response.status(400).json({
          message: "Invalid workout session capacity."
        });
      }

      const timestampPattern =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

      if (
        typeof startsAt !== "string" ||
        typeof endsAt !== "string" ||
        !timestampPattern.test(startsAt) ||
        !timestampPattern.test(endsAt)
      ) {
        return response.status(400).json({
          message: "Invalid workout session timestamps."
        });
      }

      const startTime = Date.parse(startsAt);
      const endTime = Date.parse(endsAt);

      if (
        !Number.isFinite(startTime) ||
        !Number.isFinite(endTime)
      ) {
        return response.status(400).json({
          message: "Invalid workout session timestamps."
        });
      }

      if (startTime <= Date.now()) {
        return response.status(400).json({
          message: "Workout session must start in the future."
        });
      }

      if (endTime <= startTime) {
        return response.status(400).json({
          message: "End time must be after start time."
        });
      }

      const result = await pool.query(
        `INSERT INTO workout_sessions (
          title,
          description,
          starts_at,
          ends_at,
          capacity
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id`,
        [
          normalizedTitle,
          description === null ? null : description.trim(),
          startsAt,
          endsAt,
          capacity
        ]
      );

      return response.status(201).json({
        message: "Workout session created successfully.",
        workoutSessionId: result.rows[0].id
      });

    } catch (error) {
      if (
        error.code === "22007" ||
        error.code === "22008" ||
        error.code === "22009"
      ) {
        return response.status(400).json({
          message: "Invalid workout session timestamps."
        });
      }

      next(error);
    }
  });

  server.patch(`${path}/:id`, async (request, response, next) => {
    try {
      const { id } = request.params;

      const {
        title,
        description,
        startsAt,
        endsAt,
        capacity
      } = request.body;

      if (
        !/^[1-9]\d*$/.test(id) ||
        id.length > 19 ||
        BigInt(id) > 9223372036854775807n
      ) {
        return response.status(400).json({
          message: "Invalid workout ID."
        });
      }

      const updates = [];
      const values = [];

      // Validate title
      if (title !== undefined) {
        if (
          typeof title !== "string" ||
          title.trim().length === 0 ||
          title.trim().length > 150
        ) {
          return response.status(400).json({
            message: "Invalid workout title."
          });
        }

        values.push(title.trim());
        updates.push(`title = $${values.length}`);
      }

      // Validate description
      if (description !== undefined) {
        if (
          description !== null &&
          typeof description !== "string"
        ) {
          return response.status(400).json({
            message: "Invalid workout description."
          });
        }

        values.push(
          description === null ? null : description.trim()
        );

        updates.push(`description = $${values.length}`);
      }

      // Validate capacity
      if (capacity !== undefined) {
        if (
          !Number.isInteger(capacity) ||
          capacity < 1 ||
          capacity > 2147483647
        ) {
          return response.status(400).json({
            message: "Invalid workout capacity."
          });
        }

        values.push(capacity);
        updates.push(`capacity = $${values.length}`);
      }

      // Validate timestamps
      const timestampPattern =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

      if (startsAt !== undefined) {
        if (
          typeof startsAt !== "string" ||
          !timestampPattern.test(startsAt) ||
          !Number.isFinite(Date.parse(startsAt))
        ) {
          return response.status(400).json({
            message: "Invalid workout start time."
          });
        }

        values.push(startsAt);
        updates.push(`starts_at = $${values.length}`);
      }

      if (endsAt !== undefined) {
        if (
          typeof endsAt !== "string" ||
          !timestampPattern.test(endsAt) ||
          !Number.isFinite(Date.parse(endsAt))
        ) {
          return response.status(400).json({
            message: "Invalid workout end time."
          });
        }

        values.push(endsAt);
        updates.push(`ends_at = $${values.length}`);
      }

      if (updates.length === 0) {
        return response.status(400).json({
          message: "No valid fields to update."
        });
      }

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        // Fetch and lock workout
        const workoutResult = await client.query(
          `SELECT id,
            starts_at,
            ends_at,
            capacity,
            status
          FROM workout_sessions
          WHERE id = $1
          FOR UPDATE`,
          [id]
        );

        if (workoutResult.rowCount === 0) {
          await client.query("ROLLBACK");

          return response.status(404).json({
            message: "Workout not found."
          });
        }

        const workout = workoutResult.rows[0];

        // Verify workout status
        if (workout.status !== "scheduled") {
          await client.query("ROLLBACK");

          return response.status(409).json({
            message: "Only scheduled workouts can be updated."
          });
        }

        // Prevent modification of workouts that have started
        if (new Date(workout.starts_at).getTime() <= Date.now()) {
          await client.query("ROLLBACK");

          return response.status(409).json({
            message: "Workouts that have started cannot be updated."
          });
        }

        // Determine resulting start and end times
        const nextStartTime = startsAt !== undefined
          ? Date.parse(startsAt)
          : new Date(workout.starts_at).getTime();

        const nextEndTime = endsAt !== undefined
          ? Date.parse(endsAt)
          : new Date(workout.ends_at).getTime();

        if (nextStartTime <= Date.now()) {
          await client.query("ROLLBACK");

          return response.status(400).json({
            message: "Workout must start in the future."
          });
        }

        if (nextEndTime <= nextStartTime) {
          await client.query("ROLLBACK");

          return response.status(400).json({
            message: "End time must be after start time."
          });
        }

        // Verify capacity against existing bookings
        if (capacity !== undefined) {
          const bookingResult = await client.query(
            `SELECT COUNT(*)::integer AS booked_slots
            FROM bookings
            WHERE workout_session_id = $1
              AND status IN ('booked', 'completed')`,
            [id]
          );

          const bookedSlots =
            bookingResult.rows[0].booked_slots;

          if (capacity < bookedSlots) {
            await client.query("ROLLBACK");

            return response.status(409).json({
              message: "Capacity cannot be lower than existing bookings."
            });
          }
        }

        // Update workout
        updates.push("updated_at = NOW()");
        values.push(id);

        await client.query(
          `UPDATE workout_sessions
          SET ${updates.join(", ")}
          WHERE id = $${values.length}`,
          values
        );

        await client.query("COMMIT");

        return response.status(204).end();

      } catch (error) {
        await client.query("ROLLBACK");

        if (
          error.code === "22007" ||
          error.code === "22008" ||
          error.code === "22009"
        ) {
          return response.status(400).json({
            message: "Invalid workout timestamps."
          });
        }

        if (
          error.code === "23514" &&
          error.constraint === "chk_session_times"
        ) {
          return response.status(400).json({
            message: "End time must be after start time."
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
