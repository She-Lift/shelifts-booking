import session from "express-session";
import connectPgSimple from "connect-pg-simple";

import pool from "../db/pool.js";

const PgSession = connectPgSimple(session);

const sessionMiddleware = session({
  store: new PgSession({
    pool,
    tableName: "user_sessions",
    createTableIfMissing: true,
    pruneSessionInterval: 60
  }),

  name: "shelifts.sid",

  secret: process.env.SESSION_SECRET,

  resave: false,
  saveUninitialized: false,

  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7_200_000
  }
});

export default sessionMiddleware;