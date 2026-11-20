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