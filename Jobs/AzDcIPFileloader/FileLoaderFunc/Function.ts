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

    context.log('Job-Func-AzDcIpFileLoader started');

    logness: Logness;

    if (!globalThis.fetch) {
        globalThis.fetch = fetch;
    }

    try
    {
        context.log('Initilaizing app config from App Configuration service');

        const appconfig: AppConfig = await GetAppConfig();

        this.logness = Logness.Ready(appconfig);

        const fileDownloader = new HttpFile(this.logness);

        const cacher: ICacher = new Redis(appconfig.RedisHost, appconfig.RedisKey, this.logness);

        context.log('Job-AzDcIpFileLoader initialize app configuration complete');
        this.logness.Info(`Job-AzDcIpFileLoader initialize app configuration complete`)

        context.log(`Job-AzDcIpFileLoader started, downloading file from ${appconfig.AzDcIPFileUrl}`);
        this.logness.Info(`Job-AzDcIpFileLoader started, downloading file from ${appconfig.AzDcIPFileUrl}`)

        const resp = await fetch(appconfig.AzDcIPFileUrl);
        const jObj = await resp.json();

        context.log('Download file complete, sorting data for caching');
        this.logness.Info('Download file complete, sorting data for caching');

        const orgDcIp = DcIpCacheDataOrganizer.GroupByCacheKey(jObj);

        context.log('Sorting data done, updating cache');
        this.logness.Info('Sorting data done, updating cache');

        _.each(orgDcIp, (dcip) => {
            cacher.Set(dcip.CacheKey, JSON.stringify(dcip.DcIpPrefixes));
        })

        context.log('Updating cache done, saving file json content to Blob Storage');
        this.logness.Info('Updating cache done, saving file json content to Blob Storage');

        //TODO: save to storage
        const storager = new FileStorager(this.logness);
        storager.Ready.then(async () => {
            await storager.UploadFile(JSON.stringify(jObj));
        });

        context.log('File content saved to Blob Storage, job completed');
        this.logness.Info('File content saved to Blob Storage, job completed');
    }
    catch(err) {
        if(!err) {
            context.log(err);
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
