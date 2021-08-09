import * as _ from 'lodash';

export default class Utils {

    //Check is null or undefine
    static IsNuuD(obj: any): boolean {
        if(obj === undefined || obj == '') {
            return true;
        } else {
            return false;
        }
    }

    static IsIPv6(ipPrefix: string): boolean {
        if(ipPrefix.split(':').length > 1)
            return true;
        else
            return false;
    }

    static GetFirst3PartOfIP(ip: string): string {
        if(!ip)
            return '';

        const splitDot = ip.split('.');
        const first3PartOfIP = _.initial(splitDot).join('.'); //get first 3 part of ip address for searching

        if(!first3PartOfIP) {
            console.log(`key is null ${first3PartOfIP}`);
        }

        return first3PartOfIP
    }
}