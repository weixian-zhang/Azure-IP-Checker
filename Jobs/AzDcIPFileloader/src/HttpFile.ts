import {EventEmitter} from 'events';
import * as https from 'https';

export default class HttpFile {

    public DownloadFileToByteBuffer(url: string, func: (json: string) => void) {

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
}