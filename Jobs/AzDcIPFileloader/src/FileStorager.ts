import {BlobServiceClient, ContainerClient} from '@azure/storage-blob'
import { resolve } from 'path/posix';
import {AppConfig, AppConfiger} from '../../../Shared/AppConfiger'
import {DefaultAzureCredential} from '@azure/identity';

export class FileStorager {

    public Ready: Promise<any>;

    appConfig: AppConfig;
    blobClient: BlobServiceClient;
    containerName = 'azure-dc-ip-files';
    configer: AppConfiger;

    constructor() {
        this.Ready = new Promise(async (resolve, reject) => {
            this.configer = new AppConfiger();
            this.appConfig = await this.configer.GetAppConfig();
            resolve(undefined);
        });
    }


    async UploadFile(content: string): Promise<any> {

        const url = `https://${this.appConfig.StorageName}.blob.core.windows.net`;

        const cred = this.configer.GetAzCred();

        this.blobClient = new BlobServiceClient(url, cred);

        const container =  this.blobClient.getContainerClient(this.containerName);

        const blobName = `ServiceTag_Public_${(new Date).toISOString().slice(0,10).replace(/-/g,"")}.json`

        const blobClient =  container.getBlockBlobClient(blobName);

        return new Promise(async (resolve, reject) => {
            try{
                const resp = await blobClient.upload(Buffer.from(content), content.length);
                resolve(undefined);
            }
            catch(err) {
                //TODO log
                reject(err);
            }

        })
    }
}