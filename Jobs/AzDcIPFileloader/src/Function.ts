import { AzureFunction, Context } from "@azure/functions"
import * as _ from 'lodash';
import {DcIpPrefix, DcIpCacheDataOrganizer} from '../../../Shared/DcIP';
import {ICacher, Redis} from '../../../Shared/Cacher';
import {AppConfiger, AppConfig} from '../../../Shared/AppConfiger';
import HttpFile from './HttpFile';
import fetch from 'node-fetch';
import { DH_UNABLE_TO_CHECK_GENERATOR } from "constants";

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

        const fileDownloader = new HttpFile();

        const cacher: ICacher = new Redis(appconfig.RedisHost, appconfig.RedisKey);

        const dcIPs: DcIpPrefix[] = [];

        const resp = await fetch(appconfig.AzDcIPFileUrl);
        const jObj = await resp.json();

        const orgDcIp = DcIpCacheDataOrganizer.GroupByCacheKey(jObj);

        _.each(orgDcIp, (dcip) => {
            cacher.Set(dcip.CacheKey, JSON.stringify(dcip.DcIpPrefixes));
        })

        // _.each(jObj.values, (ipVal) => {

        //     _.each(ipVal.properties.addressPrefixes, (ipprefix) => {
        //         const dcIpPrefix = new DcIpPrefix();
        //         dcIpPrefix.SetIPAndPrefix(ipprefix);
        //         dcIpPrefix.Id = ipVal.id;
        //         dcIpPrefix.Name = ipVal.name;
        //         if(ipVal.properties.region == '')
        //             dcIpPrefix.Region = 'AllRegion';
        //         else
        //             dcIpPrefix.Region = ipVal.properties.region;
        //         dcIpPrefix.SystemService = ipVal.properties.systemService;

        //         dcIPs.push(dcIpPrefix);
        //     });

        // });

        // _.each(dcIPs, (dcip) => {
        //     cacher.Set(dcip.SearchPattern, JSON.stringify(dcip));
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
