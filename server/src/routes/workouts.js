import pool from "../db/pool.js";

export default function workouts(server, path) {
  path += "/workouts";

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
}
