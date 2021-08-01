import Utils from './Utils';

export class DcIpPrefix {
    IPPrefix: string
    IP: string
    Prefix: string
    Id: string
    Name: string
    SystemService: string
    Region: string

    SetIPAndPrefix(ipPrefix: string) {
        if(Utils.IsIPv6(ipPrefix))
            return;

        const splitted = ipPrefix.split('/');
        const ip = splitted[0];
        const prefix = splitted[1];

        this.IPPrefix = ipPrefix;
        this.IP = ip;
        this.Prefix = prefix;
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