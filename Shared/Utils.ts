
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
}