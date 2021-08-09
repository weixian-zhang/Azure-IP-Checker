import { ICacher, Redis } from "../../Shared/Cacher";
import { AppConfig } from "../../Shared/AppConfiger";
import { Logness } from "../../Shared/Logness";
import Utils from "../../Shared/Utils";
import { DcIpPrefix } from "@shared/DcIP";
import * as ipaddr from "ipaddr.js";
import * as _ from "lodash";

export default class IPer {
  private cacher: ICacher = {} as ICacher;
  private logness: Logness = {} as Logness;

  constructor(appconfig: AppConfig, logness: Logness) {
    this.logness = logness;
    this.cacher = new Redis(
      appconfig.RedisHost,
      appconfig.RedisKey,
      this.logness
    );
  }

  IsAzureIp(ips: string[]): Promise<IPCheckResult[]> {
    return new Promise(async resolve => {
      const results: IPCheckResult[] = [];

      for (let ip of ips) {
        const result = await this.CheckIp(ip);
        results.push(result);
      }

      return resolve(results);
    });
  }

  private IsValidIP(ip: string): boolean {
    if (!ipaddr.IPv4.isValid(ip)) {
      try {
        ipaddr.IPv4.parseCIDR(ip);
        return true;
      } catch (err) {
        if (err) {
          return false;
        }
      }
    }

    return true;
  }

  private IsCidr(ip: string): boolean {
    if (!this.IsValidIP(ip)) return false;

    try {
      ipaddr.IPv4.parseCIDR(ip);
      return true;
    } catch (err) {
      if (err) {
        return false;
      }

      return false;
    }
  }

  private async CheckIp(ip: string): Promise<IPCheckResult> {
    return new Promise(async (resolve, reject) => {
      if (!this.IsValidIP(ip)) {
        return resolve(new IPCheckResult(false, ip, "", "", "", false));
      }

      try {
        const first3Part: string = Utils.GetFirst3PartOfIP(ip);
        const searchPattern = first3Part + "*";

        this.cacher.Search(searchPattern).then((dcips: DcIpPrefix[]) => {
          if (dcips.length == 0) {
            return resolve(new IPCheckResult(false, ip, "", "", "", true));
          }

          for (let dcip of dcips) {
            if (ip == dcip.IP) {
              resolve(
                new IPCheckResult(
                  true,
                  ip,
                  dcip.IPPrefix,
                  dcip.Name,
                  dcip.Region,
                  true
                )
              );
              break;
            }

            let ipadr: ipaddr.IPv4;
            if (this.IsCidr(ip)) {
              const pCidr = ipaddr.IPv4.parseCIDR(ip);
              ipadr = pCidr[0];
            } else ipadr = ipaddr.IPv4.parse(ip);

            const ipprefix = ipaddr.IPv4.parseCIDR(dcip.IPPrefix);
            const isazip = ipadr.match(ipprefix);

            if (!isazip) {
              return resolve(new IPCheckResult(false, ip, "", "", "", false));
              break;
            } else {
              resolve(
                new IPCheckResult(
                  true,
                  ip,
                  dcip.IPPrefix,
                  dcip.Name,
                  dcip.Region,
                  true
                )
              );
              break;
            }
          }
        });
      } catch (err) {
        this.logness.Error(err);
        reject(err);
      }
    });
  }
}

export class IPCheckResult {
  public IsAzureIP: boolean = false;
  public IPinQuestion: string = "";
  public BelongToAzIPRange: string = "";
  public ServiceTag: string = "";
  public Region: string = "";
  public IsValidIP: boolean = false;

  constructor(
    isAzIp: boolean,
    ipInQns: string,
    belongToAzIPRange?: string,
    serviceTag?: string,
    region?: string,
    isValidIP: boolean = false
  ) {
    this.IsAzureIP = isAzIp;
    this.IPinQuestion = ipInQns;
    this.BelongToAzIPRange = belongToAzIPRange ? belongToAzIPRange : "";
    this.ServiceTag = serviceTag ? serviceTag : "";
    this.Region = region ? region : "";
    this.IsValidIP = isValidIP;
  }
}
