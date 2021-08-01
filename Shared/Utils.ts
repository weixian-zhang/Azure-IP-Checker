
export default class Utils {
    static IsIPv6(ipPrefix: string): boolean {
        if(ipPrefix.length > 16)
            return true;
        else
            return false;
    }
}