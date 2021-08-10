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

    static GetFirst2PartOfIP(ip: string): string {
        if(!ip)
            return '';

        const splitDot = ip.split('.');
        const first2PartOfIP = splitDot.slice(0, 2).join('.'); //get first 3 part of ip address for searching

        if(!first2PartOfIP) {
            console.log(`key is null ${first2PartOfIP}`);
        }

        return first2PartOfIP
    }
}