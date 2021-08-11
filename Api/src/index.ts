import HttpServer from "./HttpServer";

(async function() {
  console.log("initializing http server");

  const server = await new HttpServer().Ready();

  console.log("http server initalized, starting to listen");

  server.Listen();
})();
