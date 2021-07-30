export class DcIP {
    Id: string
    Name: string
    SystemService: string
    Region: string
    IPPrefixes: IPPrefix[]

    constructor(id: string, name: string, systemService: string, region: string) {
        this.Id = id;
        this.Name = name;
        this.SystemService = systemService;
        this.Region = region;
        this.IPPrefixes = [];
    }
}

export class IPPrefix {
    IPPrefix: string
    IP: string
    Prefix: string

    constructor(ipprefix: string) {
        this.IPPrefix = ipprefix;
        this.SetIPAndPrefix(ipprefix);
    }

    SetIPAndPrefix(ipPrefix: string) {
        if(IPPrefix.IsIPv6(ipPrefix))
            return;

        const splitted = ipPrefix.split('/');
        const ip = splitted[0];
        const prefix = splitted[1];

        this.IP = ip;
        this.Prefix = prefix;
    }

    static IsIPv6(ipPrefix: string): boolean {
        if(ipPrefix.length > 16)
            return true;
        else
            return false;
    }
}