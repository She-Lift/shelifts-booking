export default function errorHandler(error, request, response, next) {
  console.error(error);

  if (response.headersSent) {
    return next(error);
  }

  const status = error.status >= 400 && error.status < 600
    ? error.status
    : 500;

  response.status(status).json({
    message: status === 500
      ? "An unexpected server error occurred."
      : "The request could not be processed."
  });
}