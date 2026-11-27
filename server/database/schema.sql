CREATE TABLE users
(
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username            VARCHAR(100) NOT NULL UNIQUE,
    password_hash       TEXT NOT NULL,
    role                VARCHAR(20) NOT NULL DEFAULT 'customer',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_users_role
        CHECK (role IN ('admin', 'customer'))
);

CREATE TABLE punch_card_types
(
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name                  VARCHAR(100) NOT NULL UNIQUE,
    total_credits         INTEGER NOT NULL,
    validity_months       INTEGER NOT NULL,
    max_sessions_per_week INTEGER,
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT chk_card_credits
        CHECK (total_credits > 0),

    CONSTRAINT chk_card_validity
        CHECK (validity_months > 0),

    CONSTRAINT chk_card_weekly_limit
        CHECK (
            max_sessions_per_week IS NULL
            OR max_sessions_per_week > 0
        )
);

CREATE TABLE user_punch_cards
(
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id               BIGINT NOT NULL REFERENCES users(id),
    punch_card_type_id    BIGINT NOT NULL REFERENCES punch_card_types(id),

    total_credits         INTEGER NOT NULL,
    remaining_credits     INTEGER NOT NULL,
    max_sessions_per_week INTEGER,

    valid_from            DATE NOT NULL,
    valid_until           DATE NOT NULL,

    status                VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_remaining_credits
        CHECK (remaining_credits >= 0),

    CONSTRAINT chk_total_credits
        CHECK (total_credits > 0),

    CONSTRAINT chk_remaining_max
        CHECK (remaining_credits <= total_credits),

    CONSTRAINT chk_user_card_weekly_limit
        CHECK (
            max_sessions_per_week IS NULL
            OR max_sessions_per_week > 0
        ),

    CONSTRAINT chk_card_dates
        CHECK (valid_until >= valid_from),

    CONSTRAINT chk_card_status
        CHECK (status IN ('active', 'revoked'))
);

CREATE TABLE workout_schedules
(
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title            VARCHAR(150) NOT NULL,
    description      TEXT,

    weekday          INTEGER NOT NULL,
    start_time       TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    capacity         INTEGER NOT NULL,

    timezone         VARCHAR(50) NOT NULL DEFAULT 'Europe/Stockholm',
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT chk_schedule_weekday
        CHECK (weekday BETWEEN 1 AND 7),

    CONSTRAINT chk_schedule_duration
        CHECK (duration_minutes > 0),

    CONSTRAINT chk_schedule_capacity
        CHECK (capacity > 0)
);

CREATE TABLE workout_sessions
(
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    schedule_id BIGINT REFERENCES workout_schedules(id),

    title       VARCHAR(150) NOT NULL,
    description TEXT,

    starts_at   TIMESTAMPTZ NOT NULL,
    ends_at     TIMESTAMPTZ NOT NULL,

    capacity    INTEGER NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'scheduled',

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_session_times
        CHECK (ends_at > starts_at),

    CONSTRAINT chk_session_capacity
        CHECK (capacity > 0),

    CONSTRAINT chk_session_status
        CHECK (status IN ('scheduled', 'cancelled', 'completed'))
);

CREATE TABLE bookings
(
    id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id            BIGINT NOT NULL REFERENCES users(id),
    workout_session_id BIGINT NOT NULL REFERENCES workout_sessions(id),
    user_punch_card_id BIGINT NOT NULL REFERENCES user_punch_cards(id),

    status             VARCHAR(30) NOT NULL DEFAULT 'booked',
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at       TIMESTAMPTZ,

    CONSTRAINT chk_booking_status
        CHECK (
            status IN (
                'booked',
                'cancelled_by_customer',
                'cancelled_by_admin',
                'completed'
            )
        )
);

CREATE UNIQUE INDEX ux_active_booking
ON bookings (user_id, workout_session_id)
WHERE status IN ('booked', 'completed');

CREATE TABLE credit_transactions
(
    id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_punch_card_id BIGINT NOT NULL REFERENCES user_punch_cards(id),
    booking_id         BIGINT REFERENCES bookings(id),

    amount             INTEGER NOT NULL,
    reason             VARCHAR(30) NOT NULL,

    performed_by       BIGINT REFERENCES users(id),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_transaction_amount
        CHECK (amount <> 0),

    CONSTRAINT chk_transaction_reason
        CHECK (
            reason IN (
                'card_issued',
                'booking',
                'cancellation',
                'admin_adjustment'
            )
        )
);

CREATE UNIQUE INDEX ux_booking_credit_event
ON credit_transactions (booking_id, reason)
WHERE booking_id IS NOT NULL
    AND reason IN ('booking', 'cancellation');

-- Find customer bookings
CREATE INDEX idx_bookings_user
ON bookings (user_id);

-- Find bookings for a specific workout
CREATE INDEX idx_bookings_workout
ON bookings (workout_session_id);

-- Find punch cards belonging to a customer
CREATE INDEX idx_user_cards_user
ON user_punch_cards (user_id);

-- Find upcoming workouts
CREATE INDEX idx_workout_sessions_starts_at
ON workout_sessions (starts_at);

-- Find credit history
CREATE INDEX idx_credit_transactions_card
ON credit_transactions (user_punch_card_id);

CREATE OR REPLACE VIEW vw_user_punch_cards AS
SELECT
    upc.id,
    upc.user_id,
    u.username,
    upc.punch_card_type_id,
    pct.name AS punch_card_type_name,
    upc.total_credits,
    upc.remaining_credits,
    upc.max_sessions_per_week,
    upc.valid_from::text AS valid_from,
    upc.valid_until::text AS valid_until,
    upc.status,
    upc.created_at
FROM user_punch_cards upc
INNER JOIN users u
    ON upc.user_id = u.id
INNER JOIN punch_card_types pct
    ON upc.punch_card_type_id = pct.id;

CREATE OR REPLACE VIEW vw_workouts AS
SELECT
    ws.id,
    ws.schedule_id,
    ws.title,
    ws.description,
    ws.starts_at,
    ws.ends_at,
    ws.capacity,
    ws.status,
    ws.created_at,
    ws.updated_at,
    COUNT(b.id)::integer AS booked_slots,
    (
        ws.capacity - COUNT(b.id)
    )::integer AS available_slots
FROM workout_sessions ws
LEFT JOIN bookings b
    ON ws.id = b.workout_session_id
    AND b.status IN ('booked', 'completed')
GROUP BY ws.id;

CREATE OR REPLACE VIEW vw_bookings AS
SELECT
    b.id,
    b.user_id,
    u.username,
    b.workout_session_id AS workout_id,
    ws.title AS workout_title,
    ws.starts_at AS workout_starts_at,
    ws.ends_at AS workout_ends_at,
    ws.status AS workout_status,
    b.user_punch_card_id,
    pct.name AS punch_card_type_name,
    b.status,
    b.created_at,
    b.cancelled_at
FROM bookings b
INNER JOIN users u
    ON b.user_id = u.id
INNER JOIN workout_sessions ws
    ON b.workout_session_id = ws.id
INNER JOIN user_punch_cards upc
    ON b.user_punch_card_id = upc.id
INNER JOIN punch_card_types pct
    ON upc.punch_card_type_id = pct.id;

