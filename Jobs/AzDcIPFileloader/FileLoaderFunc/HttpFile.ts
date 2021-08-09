import {EventEmitter} from 'events';
import * as https from 'https';
import {Logness} from '../../../Shared/Logness';

export default class HttpFile {

    logness: Logness;

    constructor(logness: Logness) {
        this.logness = logness;
    }

    public DownloadFileToByteBuffer(url: string, func: (json: string) => void) {

        try
        {
            https.get(url, (res) => {

                const fileBinaryChunk = [];

                res.on('data', (dataChunk) => {
                    fileBinaryChunk.push(dataChunk);
                }).on('end', () => {
                    let buffer = Buffer.concat(fileBinaryChunk);

                    let jsonContent: string = buffer.toString('utf-8');

                    func(jsonContent);
                });
            });
        }
        catch(err) {
            this.logness.Error(err);
        }
    }
}