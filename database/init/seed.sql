-- Users
INSERT INTO users 
    (username, password_hash, role, is_active, must_change_password, created_at) 
VALUES ('devadmin', 'scrypt-v1$32768$8$1$ee9faef53fba60c05b789404edde550c$6579094799e98a9c1c3660076f89e2fc8e574ca9f36248ce02ee3cd01355fb8dad378efb2b8b2756ef3aaeddc30574f8a35ae9e06b2b29970f9664ac8dd630da', 'admin', true, true, '2026-11-21 12:43:15.944819 +00:00');


-- Punch card types

INSERT INTO punch_card_types
    (name, total_credits, validity_months, max_sessions_per_week)
VALUES
    ('8 Pass', 8, 2, 2),
    ('12 Pass', 12, 3, 3);


-- Recurring workout schedules

INSERT INTO workout_schedules
    (title, weekday, start_time, duration_minutes, capacity)
VALUES
    ('Strength Training', 1, '18:00', 60, 10),
    ('Strength Training', 3, '18:00', 60, 10),
    ('Strength Training', 5, '17:00', 60, 10),
    ('Strength Training', 6, '10:00', 60, 10);