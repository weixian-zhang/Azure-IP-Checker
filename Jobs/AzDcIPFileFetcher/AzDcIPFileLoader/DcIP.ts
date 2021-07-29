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
    }
}

export class IPPrefix {
    IPPrefix: string
    IP: string
    Prefix: string

    static SetIPPrefix(ipPrefix: string) {
        if(this.IsIPv6(ipPrefix))
            return;

        //ipAndPrefix ipPrefix.split('/');
    }

    static IsIPv6(ipPrefix: string): boolean {
        if(ipPrefix.length > 16)
            return true;
        else
            return false;
    }
}