
import pool from "../db/pool.js";

export default function punchCards(server, path) {
  path += "/punch-cards";

  // ========================================
  // Punch Card Types
  // ========================================

  server.get(`${path}/types`, async (request, response, next) => {
    try {
      const result = await pool.query(
        `SELECT id,
          name,
          total_credits,
          validity_months,
          max_sessions_per_week,
          is_active
        FROM punch_card_types
        ORDER BY name ASC`
      );

      return response.status(200).json(result.rows);

    } catch (error) {
      next(error);
    }
  });

  server.get(`${path}/types/:id`, async (request, response, next) => {
    try {
      const { id } = request.params;

      if (
        !/^[1-9]\d*$/.test(id) ||
        id.length > 19 ||
        BigInt(id) > 9223372036854775807n
      ) {
        return response.status(400).json({
          message: "Invalid punch card type ID."
        });
      }

      const result = await pool.query(
        `SELECT id,
        name,
        total_credits,
        validity_months,
        max_sessions_per_week,
        is_active
      FROM punch_card_types
      WHERE id = $1`,
        [id]
      );

      if (result.rowCount === 0) {
        return response.status(404).json({
          message: "Punch card type not found."
        });
      }

      return response.status(200).json(result.rows[0]);

    } catch (error) {
      next(error);
    }
  });

  server.post(`${path}/types`, async (request, response, next) => {
    try {
      const {
        name,
        totalCredits,
        validityMonths,
        maxSessionsPerWeek = null
      } = request.body;

      const normalizedName =
        typeof name === "string" ? name.trim() : "";

      if (
        normalizedName.length === 0 ||
        normalizedName.length > 100 ||
        !Number.isInteger(totalCredits) ||
        totalCredits < 1 ||
        totalCredits > 2147483647 ||
        !Number.isInteger(validityMonths) ||
        validityMonths < 1 ||
        validityMonths > 2147483647
      ) {
        return response.status(400).json({
          message: "Invalid punch card type data."
        });
      }

      if (
        maxSessionsPerWeek !== null &&
        (
          !Number.isInteger(maxSessionsPerWeek) ||
          maxSessionsPerWeek < 1 ||
          maxSessionsPerWeek > 2147483647
        )
      ) {
        return response.status(400).json({
          message: "Invalid weekly session limit."
        });
      }

      await pool.query(
        `INSERT INTO punch_card_types (
          name,
          total_credits,
          validity_months,
          max_sessions_per_week
        )
        VALUES ($1, $2, $3, $4)`,
        [
          normalizedName,
          totalCredits,
          validityMonths,
          maxSessionsPerWeek
        ]
      );

      return response.status(201).json({
        message: "Punch card type created successfully."
      });

    } catch (error) {
      if (error.code === "23505") {
        return response.status(409).json({
          message: "Punch card type already exists."
        });
      }

      next(error);
    }
  });

  server.patch(`${path}/types/:id`, async (request, response, next) => {
    try {
      const { id } = request.params;

      const {
        name,
        totalCredits,
        validityMonths,
        maxSessionsPerWeek
      } = request.body;

      if (
        !/^[1-9]\d*$/.test(id) ||
        id.length > 19 ||
        BigInt(id) > 9223372036854775807n
      ) {
        return response.status(400).json({
          message: "Invalid punch card type ID."
        });
      }

      const updates = [];
      const values = [];

      if (name !== undefined) {
        if (
          typeof name !== "string" ||
          name.trim().length === 0 ||
          name.trim().length > 100
        ) {
          return response.status(400).json({
            message: "Invalid punch card type name."
          });
        }

        values.push(name.trim());
        updates.push(`name = $${values.length}`);
      }

      if (totalCredits !== undefined) {
        if (
          !Number.isInteger(totalCredits) ||
          totalCredits < 1 ||
          totalCredits > 2147483647
        ) {
          return response.status(400).json({
            message: "Invalid total credits."
          });
        }

        values.push(totalCredits);
        updates.push(`total_credits = $${values.length}`);
      }

      if (validityMonths !== undefined) {
        if (
          !Number.isInteger(validityMonths) ||
          validityMonths < 1 ||
          validityMonths > 2147483647
        ) {
          return response.status(400).json({
            message: "Invalid validity period."
          });
        }

        values.push(validityMonths);
        updates.push(`validity_months = $${values.length}`);
      }

      if (maxSessionsPerWeek !== undefined) {
        if (
          maxSessionsPerWeek !== null &&
          (
            !Number.isInteger(maxSessionsPerWeek) ||
            maxSessionsPerWeek < 1 ||
            maxSessionsPerWeek > 2147483647
          )
        ) {
          return response.status(400).json({
            message: "Invalid weekly session limit."
          });
        }

        values.push(maxSessionsPerWeek);
        updates.push(`max_sessions_per_week = $${values.length}`);
      }

      if (updates.length === 0) {
        return response.status(400).json({
          message: "No valid fields to update."
        });
      }

      values.push(id);

      const result = await pool.query(
        `UPDATE punch_card_types
        SET ${updates.join(", ")}
        WHERE id = $${values.length}`,
        values
      );

      if (result.rowCount === 0) {
        return response.status(404).json({
          message: "Punch card type not found."
        });
      }

      return response.status(204).end();

    } catch (error) {
      if (error.code === "23505") {
        return response.status(409).json({
          message: "Punch card type already exists."
        });
      }

      next(error);
    }
  });

  server.patch(`${path}/types/:id/deactivate`, async (request, response, next) => {
    try {
      const { id } = request.params;

      if (
        !/^[1-9]\d*$/.test(id) ||
        id.length > 19 ||
        BigInt(id) > 9223372036854775807n
      ) {
        return response.status(400).json({
          message: "Invalid punch card type ID."
        });
      }

      const result = await pool.query(
        `UPDATE punch_card_types
        SET is_active = false
        WHERE id = $1`,
        [id]
      );

      if (result.rowCount === 0) {
        return response.status(404).json({
          message: "Punch card type not found."
        });
      }

      return response.status(204).end();

    } catch (error) {
      next(error);
    }
  });


  // ========================================
  // User Punch Cards
  // ========================================



}
