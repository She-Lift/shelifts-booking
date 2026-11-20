export default function health(server, path) {
  server.get(`${path}/health`, (request, response) => {
    response.status(200).json({
      status: "ok",
      message: "SHE LIFTS API is running"
    });
  });
}