import { AzureFunction, Context } from "@azure/functions"
import * as https from 'https';
import * as _ from 'lodash';
import {DcIP, IPPrefix} from './DcIP';

const AzDcIPFileUrl: string = 'https://download.microsoft.com/download/7/1/D/71D86715-5596-4529-9B13-DA13A5DE5B63/ServiceTags_Public_20210726.json';

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {

    https.get(AzDcIPFileUrl, (res) => {
        const data = [];

        res.on('data', (dataChunk) => {
            data.push(dataChunk);
        }).on('end', () => {

            let buffer = Buffer.concat(data);

            let ipFileContent: string = buffer.toString('utf-8');

            try
            {
                const jObj: any = JSON.parse(ipFileContent);

                _.forEach(jObj.values, (ipVal) => {

                    const dcip = new DcIP(ipVal.id, ipVal.name, ipVal.properties.systemService, ipVal.properties.region);

                });
            }
            catch(error) {

            }
        });
    });

    console.log('hello');
};

export default timerTrigger;
