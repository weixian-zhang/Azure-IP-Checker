import { AzureFunction, Context } from "@azure/functions"
import * as _ from 'lodash';
import {DcIpPrefix} from '../../../Shared/DcIP';
import {ICacher, Redis} from '../../../Shared/Cacher';
import {AppConfiger, AppConfig} from '../../../Shared/AppConfiger';
import HttpFile from './HttpFile';

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {

    try
    {
        const appconfig: AppConfig = await GetAppConfig();

        const fileDownloader = new HttpFile();

        const cacher: ICacher = new Redis(appconfig.RedisHost, appconfig.RedisKey);

        fileDownloader.DownloadFileToByteBuffer(appconfig.AzDcIPFileUrl, (json: string) => {

            const dcIPs: DcIpPrefix[] = [];

            const jObj: any = JSON.parse(json);

            _.forEach(jObj.values, (ipVal) => {

                //const dcip = new FileDcIP(ipVal.id, ipVal.name, ipVal.properties.systemService, ipVal.properties.region);

                _.forEach(ipVal.properties.addressPrefixes, (ipprefix) => {
                    //dcip.IPPrefixes.push(new FileIPPrefix(ipprefix))

                    const dcIpPrefix = new DcIpPrefix();
                    dcIpPrefix.SetIPAndPrefix(ipprefix);
                    dcIpPrefix.Id = ipVal.id;
                    dcIpPrefix.Name = ipVal.name;
                    dcIpPrefix.Region = ipVal.properties.region;
                    dcIpPrefix.SystemService = ipVal.properties.systemService;

                    cacher.Set(dcIpPrefix.IP, JSON.stringify(dcIpPrefix));
                });

                //dcIPs.push(dcip);

                //TODO: insert into redis
                //TODO: insert into CosmosSql
                //TODO save blob to Storage
            });
        });

        // https.get(AzDcIPFileUrl, (res) => {
        //     const fileBinaryChunk = [];

        //     res.on('data', (dataChunk) => {
        //         fileBinaryChunk.push(dataChunk);
        //     }).on('end', () => {

        //         let buffer = Buffer.concat(fileBinaryChunk);

        //         let ipFileContent: string = buffer.toString('utf-8');

        //         try
        //         {
        //             const dcIPs: DcIP[] = [];

        //             const jObj: any = JSON.parse(ipFileContent);

        //             _.forEach(jObj.values, (ipVal) => {

        //                 const dcip = new DcIP(ipVal.id, ipVal.name, ipVal.properties.systemService, ipVal.properties.region);

        //                 _.forEach(ipVal.properties.addressPrefixes, (ipprefix) => {
        //                     dcip.IPPrefixes.push(new IPPrefix(ipprefix))
        //                 });

        //                 dcIPs.push(dcip);
        //             });

        //             //TODO: insert into redis
        //             //TODO: insert into CosmosSql
        //             //TODO save blob to Storage
        //         }
        //         catch(error) {

        //         }
        //     });
        // });
    }
    catch(err) {
        //TODO: log error
        console.log(err);
    }
};

async function GetAppConfig(): Promise<AppConfig> {
    const appConfiger = new AppConfiger();
    const appconfig = await appConfiger.GetAppConfig();
    return appconfig;
}

export default timerTrigger;
