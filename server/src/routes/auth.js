import pool from "../db/pool.js";
import { hashPassword } from "../utils/password.js";

export default function auth(server, path) {
  path += "/auth";

  server.post(path, async (request, response) => {
    
  });

}