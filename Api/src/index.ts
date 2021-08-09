import HttpServer from "./HttpServer";

(async function() {
  const server = await new HttpServer().Ready();

  server.Listen();
})();
