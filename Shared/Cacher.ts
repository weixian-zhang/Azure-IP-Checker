import * as redis from 'redis';
import {DcIpPrefix} from './DcIP';

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
        this.client.hmset(key, val);
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