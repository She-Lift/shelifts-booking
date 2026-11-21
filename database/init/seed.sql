-- Users
INSERT INTO users 
    (username, password_hash, role, is_active, must_change_password, created_at) 
VALUES 
    ('devadmin', 'scrypt-v1$32768$8$1$5572bee21a0babeac681060a530673f7$417c0d8b9121f2723e9324fe08a7acc00ccd9c05b1b77c1c9bc4dd4768c43ece08dbcb3c168ad4aff2d7112e52023dd9cd4fca526aa7192103283d6e4cf2c74b', 'admin', true, false, '2026-11-21 13:53:40.623662 +00:00');


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