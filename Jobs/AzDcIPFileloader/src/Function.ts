import { AzureFunction, Context } from "@azure/functions"
import * as _ from 'lodash';
import {DcIpCacheDataOrganizer} from '../../../Shared/DcIP';
import {Logness} from '../../../Shared/Logness';
import {ICacher, Redis} from '../../../Shared/Cacher';
import {AppConfiger, AppConfig} from '../../../Shared/AppConfiger';
import {FileStorager} from './FileStorager';

import HttpFile from './HttpFile';
import fetch from 'node-fetch';

declare module globalThis {
    let fetch: { };
}

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {

    if (!globalThis.fetch) {
        globalThis.fetch = fetch;
    }

    try
    {
        const appconfig: AppConfig = await GetAppConfig();

        Logness.Ready(appconfig).Info('AzFunc started...');
        Logness.Ready(appconfig).Error(new Error('Test Error...'));

        const fileDownloader = new HttpFile();

        const cacher: ICacher = new Redis(appconfig.RedisHost, appconfig.RedisKey);

        const resp = await fetch(appconfig.AzDcIPFileUrl);
        const jObj = await resp.json();

        // const orgDcIp = DcIpCacheDataOrganizer.GroupByCacheKey(jObj);

        // _.each(orgDcIp, (dcip) => {
        //     cacher.Set(dcip.CacheKey, JSON.stringify(dcip.DcIpPrefixes));
        // })

        //TODO: save to storage
        const storager = new FileStorager();
        storager.Ready.then(async () => {
                await storager.UploadFile(JSON.stringify(jObj));
        });


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
