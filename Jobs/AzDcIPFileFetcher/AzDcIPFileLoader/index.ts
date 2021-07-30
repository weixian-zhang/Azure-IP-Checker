import { AzureFunction, Context } from "@azure/functions"
import * as https from 'https';
import * as _ from 'lodash';
import {DcIP, IPPrefix} from './DcIP';
import {AppConfiger, AppConfig} from './AppConfiger';

const AzDcIPFileUrl: string = 'https://download.microsoft.com/download/7/1/D/71D86715-5596-4529-9B13-DA13A5DE5B63/ServiceTags_Public_20210726.json';

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {

    //TODO: get config from AppConfiguration
    const appconfig: AppConfig = await GetAppConfig();

    https.get(AzDcIPFileUrl, (res) => {
        const fileBinaryChunk = [];

        res.on('data', (dataChunk) => {
            fileBinaryChunk.push(dataChunk);
        }).on('end', () => {

            let buffer = Buffer.concat(fileBinaryChunk);

            let ipFileContent: string = buffer.toString('utf-8');

            try
            {
                const dcIPs: DcIP[] = [];

                const jObj: any = JSON.parse(ipFileContent);

                _.forEach(jObj.values, (ipVal) => {

                    const dcip = new DcIP(ipVal.id, ipVal.name, ipVal.properties.systemService, ipVal.properties.region);

                    _.forEach(ipVal.properties.addressPrefixes, (ipprefix) => {
                        dcip.IPPrefixes.push(new IPPrefix(ipprefix))
                    });

                    dcIPs.push(dcip);
                });

                //TODO: insert into redis
                //TODO: insert into CosmosSql
                //TODO save blob to Storage
            }
            catch(error) {

            }
        });
    });

    console.log('hello');
};

async function GetAppConfig(): Promise<AppConfig> {
    const appConfiger = new AppConfiger();
    const appconfig = await appConfiger.GetAppConfig();
    return appconfig;
}

export default timerTrigger;
