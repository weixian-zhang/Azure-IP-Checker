import Utils from './Utils';
import * as _ from 'lodash';
import * as ipaddr from 'ipaddr.js';

export class DcIpPrefix {
    IPPrefix: string
    IP: string
    Prefix: string
    Id: string
    Name: string
    SystemService: string
    Region: string
    SearchKey: string

    SetIPAndPrefix(ipPrefix: string) {

        if(Utils.IsIPv6(ipPrefix))
            return;

        const splitted = ipPrefix.split('/');
        const ip = splitted[0];
        const prefix = splitted[1];

        this.IPPrefix = ipPrefix;
        this.IP = ip;
        this.Prefix = prefix;

        this.SearchKey = this.GetFirst3PartOfIP();
    }

    GetFirst3PartOfIP(): string {
        if(!this.IP)
            return '';

        const splitDot = this.IP.split('.');
        const first3PartOfIP =_.initial(splitDot).join('.'); //get first 3 part of ip address for searching

        if(Utils.IsNuuD(first3PartOfIP)) {
            console.log(`key is null ${first3PartOfIP}`);
        }

        return first3PartOfIP
    }
}

export class DcIpCacheItem {
    CacheKey: string
    DcIpPrefixes: DcIpPrefix[]

    constructor(key: string, ipprefixes: DcIpPrefix[]) {
        this.CacheKey = key;
        this.DcIpPrefixes = ipprefixes;
    }
}

export class DcIpCacheDataOrganizer {

    static GroupByCacheKey(dcipFileJsonObj: any): DcIpCacheItem[] {

        const flattenedDcIps = this.FlattenDcIpData(dcipFileJsonObj)

        const cachedItems = _.chain(flattenedDcIps)
            .groupBy('SearchKey')
            .map((dcip, key) => {
                return  new DcIpCacheItem(key, dcip)
            })
            .value();

        return cachedItems;
    }

    private static FlattenDcIpData(dcipFileJsonObj: any): DcIpPrefix[] {

        const dcips: DcIpPrefix[] = [];

        _.each(dcipFileJsonObj.values, (ipVal) => {

            _.each(ipVal.properties.addressPrefixes, (ipprefix) => {

                const dcIpPrefix = new DcIpPrefix();
                dcIpPrefix.SetIPAndPrefix(ipprefix);
                dcIpPrefix.Id = ipVal.id;
                dcIpPrefix.Name = ipVal.name;
                if(ipVal.properties.region == '')
                    dcIpPrefix.Region = 'AllRegion';
                else
                    dcIpPrefix.Region = ipVal.properties.region;
                dcIpPrefix.SystemService = ipVal.properties.systemService;

                dcips.push(dcIpPrefix);
            });
        });

        return dcips;
    }
}

// export class FileDcIP {
//     Id: string
//     Name: string
//     SystemService: string
//     Region: string
//     IPPrefixes: FileIPPrefix[]

//     constructor(id: string, name: string, systemService: string, region: string) {
//         this.Id = id;
//         this.Name = name;
//         this.SystemService = systemService;
//         this.Region = region;
//         this.IPPrefixes = [];
//     }
// }

// export class FileIPPrefix {
//     IPPrefix: string
//     IP: string
//     Prefix: string

//     constructor(ipprefix: string) {
//         this.IPPrefix = ipprefix;
//         this.SetIPAndPrefix(ipprefix);
//     }




// }