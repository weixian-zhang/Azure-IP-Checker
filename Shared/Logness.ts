import { Context } from "@azure/functions"
import * as winston from 'winston';
import Transport = require('winston-transport');
import Eventer from './Eventer';
import { AppConfig } from './AppConfiger';
import { isContext } from 'vm';

export class Logness {

    logger: winston.Logger = {} as winston.Logger;
    static Instance: Logness;
    traceEventer: Eventer = {} as Eventer;
    errorEventer: Eventer = {} as Eventer;
    funcContext: Context;

    static Ready(config: AppConfig, funcContext: Context): Logness {

        //singleton
        if(!Logness.Instance) {

          try
            {
              const { combine, timestamp, json } = winston.format;

              Logness.Instance = new Logness();

              Logness.Instance.logger = winston.createLogger({
                format: combine(
                  timestamp(),
                  json()
                ),
                transports: [
                    new winston.transports.Console({
                        level: 'info',

                        format: winston.format.combine(
                          winston.format.colorize(),
                          winston.format.simple()
                        )
                      }),
                    new EventHubTransport({
                      format: winston.format.json()
                    })
                ]
              });

            Logness.Instance.traceEventer =
                new Eventer(config.EventHubNameTraceJobAzDcIpFileLoader, config.EventHubConnString);

            Logness.Instance.errorEventer =
                new Eventer(config.EventHubNameErrorJobAzDcIpFileLoader, config.EventHubConnString);

                Logness.Instance.funcContext = funcContext;
            }
            catch(err) {
                console.log(err)
            }
        }

        return Logness.Instance;
    }

    Info(msg: string) {
        //for azfunc
        if(!this.funcContext)
          this.funcContext.log(msg);
        Logness.Instance.logger.info(msg);
        return this;
    }

    Error(err: Error) {
      if(!err) {
        if(!this.funcContext)
          this.funcContext.log(err);
        Logness.Instance.logger.error(err.message);
        return this;
      }
    }
}

export class EventHubTransport extends Transport {
    constructor(opts) {
      super(opts);
      //
      // Consume any custom options here. e.g.:
      // - Connection information for databases
      // - Authentication information for APIs (e.g. loggly, papertrail,
      //   logentries, etc.).
      //
    }

    log(info, callback) {
      setImmediate(() => {
        this.emit('logged', info);
      });

      if(info.level == 'info') {
        Logness.Instance.traceEventer.Publish(JSON.stringify(info));
      } else if(info.level == 'error') {
        Logness.Instance.errorEventer.Publish(JSON.stringify(info));
      }

      callback();
    }
  };