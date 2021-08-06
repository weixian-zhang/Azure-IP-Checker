import * as express from "express";
import { AppConfiger, AppConfig } from "../../Shared/AppConfiger";
import { Logness } from "../../Shared/Logness";

export default class HttpServer {
  app: express.Express;
  port: number = 3000;
  appconfig: AppConfig = {} as AppConfig;
  logness: Logness = {} as Logness;

  constructor() {
    this.app = express();

    if (process.env.port) this.port = parseInt(process.env.port);
  }

  Ready(): Promise<HttpServer> {
    return new Promise(async (resolve, reject) => {
      try {
        const configer = new AppConfiger();
        this.appconfig = await configer.GetAppConfig();

        this.logness = Logness.Ready(this.appconfig, null);

        resolve(this);
      } catch (err) {
        if(!err) {
          console.log(`Error when starting up Api: ${err}`);
          reject(err);
        }
      }
    });
  }

  Listen() {
    this.app.get("/", (req, res) => {
      const queryStr = req.query.ips;

      if (!queryStr)
        res.send(
          "Querystring `ips` is empty. `ips` can be single-IP, multiple single-IP or IP Cidr. Example: `20.43.24.5,23.10.111.12/27`"
        );

      res.send("Hello World!");
    });

    this.app.listen(this.port, () => {
      this.logness.Info(`Api started and listening on port: ${this.port}`);
    });
  }
}
