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

    logness: Logness;

    if (!globalThis.fetch) {
        globalThis.fetch = fetch;
    }

    try
    {
        const appconfig: AppConfig = await GetAppConfig();

        this.logness = Logness.Ready(appconfig, context);

        const fileDownloader = new HttpFile(this.logness);

        const cacher: ICacher = new Redis(appconfig.RedisHost, appconfig.RedisKey, this.logness);

        this.logness.Info(`Job-AzDcIpFileLoader initialize app configuration complete`)

        this.logness.Info(`Job-AzDcIpFileLoader started, downloading file from ${appconfig.AzDcIPFileUrl}`)

        const resp = await fetch(appconfig.AzDcIPFileUrl);
        const jObj = await resp.json();

        this.logness.Info('Download file complete, sorting data for caching');

        const orgDcIp = DcIpCacheDataOrganizer.GroupByCacheKey(jObj);

        this.logness.Info('Sorting data done, updating cache');

        _.each(orgDcIp, (dcip) => {
            cacher.Set(dcip.CacheKey, JSON.stringify(dcip.DcIpPrefixes));
        })

        this.logness.Info('Updating cache done, saving file json content to Blob Storage');

        //TODO: save to storage
        const storager = new FileStorager(this.logness);
        storager.Ready.then(async () => {
            await storager.UploadFile(JSON.stringify(jObj));
        });

        this.logness.Info('File content saved to Blob Storage, job completed');
    }
    catch(err) {
        if(!err) {
            console.log(err);
            this.logness.Error(err);
        }
    }
};

async function GetAppConfig(): Promise<AppConfig> {
    const appConfiger = new AppConfiger();
    const appconfig = await appConfiger.GetAppConfig();
    return appconfig;
}

export default timerTrigger;
