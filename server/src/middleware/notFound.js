export default function notFound(request, response) {
  response.status(404).json({
    message: "The requested resource could not be found."
  });
}