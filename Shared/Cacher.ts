import * as redis from 'redis';
import {DcIpPrefix} from './DcIP';
import Utils from './Utils';

export interface ICacher {
    Set: (key: string, val: string) => void
    SearchKey: (pattern: string) => DcIpPrefix[]
}

export class Redis implements ICacher {

    private client: redis.RedisClient;

    constructor(host: string, authKey: string) {

        this.client = redis.createClient(6380, host, {auth_pass: authKey, tls: {servername: host}});
    }

    public Set(key: string, val: string) {
        if(Utils.IsNuuD(key)) {
            //TODO log
            return;
        }
        this.client.hset('', key, val, (err, resp) => {
            if(err) throw err;
            console.log(resp);
        });
    }

    public SearchKey(pattern: string): DcIpPrefix[] {

        const dcips: DcIpPrefix[] = [];

        this.client.keys(pattern, (err, keys) => {
            keys.forEach((key) => {
                this.client.HGETALL(key, (err, obj) => {

                })
            })
        });

        return dcips;
    }
}