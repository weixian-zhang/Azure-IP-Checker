import HttpServer from "./HttpServer";

(async function() {
  const server = new HttpServer();

  (await server.Ready()).Listen();
})();
