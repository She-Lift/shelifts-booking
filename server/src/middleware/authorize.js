import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { match } from "path-to-regexp";

import authenticate from "./authenticate.js";

const aclPath = fileURLToPath(
  new URL("../config/acl.json", import.meta.url)
);

const { rules } = JSON.parse(
  readFileSync(aclPath, "utf8")
);

const compiledRules = rules.map((rule) => ({
  method: rule.method.toUpperCase(),
  roles: rule.roles,
  matchPath: match(rule.path, { end: true })
}));

export default function authorize(request, response, next) {
  // Find matching ACL rule for HTTP method and path.
  const rule = compiledRules.find(
    (rule) =>
      rule.method === request.method &&
      rule.matchPath(new URL(request.originalUrl, "http://localhost").pathname)
  );

  // Default deny: no matching rule.
  if (!rule) {
    return response.status(403).json({
      message: "Access denied."
    });
  }

  // Public endpoints do not require authentication.
  if (rule.roles.includes("public")) {
    return next();
  }

  // Verify session and load user from database.
  authenticate(request, response, (error) => {
    if (error) {
      return next(error);
    }

    // authenticate.js will eventually set request.user.
    const role = request.user?.role;

    if (!role || !rule.roles.includes(role)) {
      return response.status(403).json({
        message: "Access denied."
      });
    }

    next();
  });
}