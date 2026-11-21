
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

  server.patch(`${path}/types/:id/activate`, async (request, response, next) => {
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
        SET is_active = true
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

  server.get(path, async (request, response, next) => {
    try {
      const result = await pool.query(
        `SELECT *
        FROM vw_user_punch_cards
        ORDER BY created_at DESC, id DESC`
      );

      return response.status(200).json(result.rows);

    } catch (error) {
      next(error);
    }
  });

  server.post(path, async (request, response, next) => {
    try {
      const {
        userId,
        punchCardTypeId,
        validFrom
      } = request.body;

      if (
        typeof userId !== "string" ||
        !/^[1-9]\d*$/.test(userId) ||
        userId.length > 19 ||
        BigInt(userId) > 9223372036854775807n
      ) {
        return response.status(400).json({
          message: "Invalid user ID."
        });
      }

      if (
        typeof punchCardTypeId !== "string" ||
        !/^[1-9]\d*$/.test(punchCardTypeId) ||
        punchCardTypeId.length > 19 ||
        BigInt(punchCardTypeId) > 9223372036854775807n
      ) {
        return response.status(400).json({
          message: "Invalid punch card type ID."
        });
      }

      if (
        typeof validFrom !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(validFrom)
      ) {
        return response.status(400).json({
          message: "Invalid start date."
        });
      }

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        // Verify customer
        const userResult = await client.query(
          `SELECT id
          FROM users
          WHERE id = $1
            AND role = 'customer'
            AND is_active = true
          FOR SHARE`,
          [userId]
        );

        if (userResult.rowCount === 0) {
          await client.query("ROLLBACK");

          return response.status(404).json({
            message: "Active customer not found."
          });
        }

        // Fetch punch card type
        const typeResult = await client.query(
          `SELECT id,
            total_credits,
            validity_months,
            max_sessions_per_week
          FROM punch_card_types
          WHERE id = $1
            AND is_active = true
          FOR SHARE`,
          [punchCardTypeId]
        );

        if (typeResult.rowCount === 0) {
          await client.query("ROLLBACK");

          return response.status(404).json({
            message: "Active punch card type not found."
          });
        }

        const cardType = typeResult.rows[0];

        // Assign punch card to customer
        const cardResult = await client.query(
          `INSERT INTO user_punch_cards (
            user_id,
            punch_card_type_id,
            total_credits,
            remaining_credits,
            max_sessions_per_week,
            valid_from,
            valid_until
          )
          VALUES (
            $1,
            $2,
            $3,
            $3,
            $4,
            $5::date,
            ($5::date + make_interval(months => $6::integer))::date
          )
          RETURNING id`,
          [
            userId,
            punchCardTypeId,
            cardType.total_credits,
            cardType.max_sessions_per_week,
            validFrom,
            cardType.validity_months
          ]
        );

        const punchCardId = cardResult.rows[0].id;

        // Register initial credit transaction
        await client.query(
          `INSERT INTO credit_transactions (
            user_punch_card_id,
            amount,
            reason,
            performed_by
          )
          VALUES ($1, $2, 'card_issued', $3)`,
          [
            punchCardId,
            cardType.total_credits,
            request.user.id
          ]
        );

        await client.query("COMMIT");

        return response.status(201).json({
          message: "Punch card assigned successfully.",
          punchCardId
        });

      } catch (error) {
        await client.query("ROLLBACK");

        if (
          error.code === "22007" ||
          error.code === "22008"
        ) {
          return response.status(400).json({
            message: "Invalid start date or validity period."
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
