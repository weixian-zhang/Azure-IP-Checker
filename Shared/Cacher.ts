import * as redis from 'redis';
import {DcIpPrefix} from './DcIP';
import Utils from './Utils';
import {Logness} from './Logness';
import * as _ from 'lodash';

export interface ICacher {
    Set: (key: string, val: string) => void
    Search: (pattern: string) => Promise<DcIpPrefix[]>
}

export class Redis implements ICacher {

    client: redis.RedisClient;
    logness: Logness = {} as Logness;

    constructor(host: string, authKey: string, logness: Logness) {

        this.client = redis.createClient(6380, host, {auth_pass: authKey, tls: {servername: host}});

        this.logness = logness;
    }

    public Set(key: string, val: string) {
        if(Utils.IsNuuD(key)) {
            //TODO log
            return;
        }
        this.client.set(key, val, (err) => {
            if(err) {
                console.log(err);
                this.logness.Error(err);
            }
        });
    }

    public Search(pattern: string): Promise<DcIpPrefix[]> {

        const dcips: DcIpPrefix[] = [];

        return new Promise(async (resolve, reject) => {

            await this.client.keys(pattern, (err, keys) => {
                if(err) {
                    this.logness.Error(err);
                    return reject(dcips);
                }

                if(keys.length == 0) {
                    return resolve(dcips);
                }

                for(let key of keys) {
                    this.client.get(key, (err, value) => {
                        if(err) {
                            this.logness.Error(err);
                            return [];
                        }

                        const dcips = JSON.parse(value!);

                        return resolve(dcips);
                    })
                }
            });
        });
    }
}