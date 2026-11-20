export default async function authenticate(request, response, next) {
  try {
    const userId = request.session?.userId;

    if (!userId) {
      return response.status(401).json({
        message: "Authentication required."
      });
    }

    // Later:
    // Fetch user from PostgreSQL using userId.
    // Verify that the account is active.
    // Attach the verified user to request.user.

    return response.status(503).json({
      message: "Authentication is not configured yet."
    });
  } catch (error) {
    next(error);
  }
}