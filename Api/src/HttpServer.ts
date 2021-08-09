import * as express from "express";
import { AppConfiger, AppConfig } from "../../Shared/AppConfiger";
import { Logness } from "../../Shared/Logness";
import IPer, { IPCheckResult } from "./IPer";

export default class HttpServer {
  private app: express.Express;
  private port: number = 3000;
  private appconfig: AppConfig = {} as AppConfig;
  private logness: Logness = {} as Logness;
  private iper: IPer = {} as IPer;

  constructor() {
    this.app = express();

    if (process.env.port) this.port = parseInt(process.env.port);
  }

  public Ready(): Promise<HttpServer> {
    return new Promise(async (resolve, reject) => {
      try {
        const configer = new AppConfiger();
        this.appconfig = await configer.GetAppConfig();

        this.logness = Logness.Ready(this.appconfig);

        this.iper = new IPer(this.appconfig, this.logness);

        return resolve(this);
      } catch (err) {
        if (!err) {
          console.log(`Error when starting up Api: ${err}`);
          return reject(err);
        }
      }
    });
  }

  public Listen() {
    this.app.get("/", async (req, res) => {
      const queryStr: string = req.query.ips as string;

      if (!queryStr) {
        res.send(
          "Querystring `ips` is not supplied. `ips` can be single-IP, multiple single-IPs or IP Cidr combination. Example: `20.43.24.5,23.10.111.12/27`"
        );
        return;
      }

      const ipsToCheck = queryStr.split(",");

      //const results: IPCheckResult[] = await this.iper.IsAzureIp(ipsToCheck);

      this.iper.IsAzureIp(ipsToCheck).then((result: IPCheckResult[]) => {
        res.send(JSON.stringify(result));
      });
    });

    this.app.listen(this.port, () => {
      this.logness.Info(`Api started and listening on port: ${this.port}`);
    });
  }
}
