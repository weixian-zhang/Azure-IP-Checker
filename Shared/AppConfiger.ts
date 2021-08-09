import {VisualStudioCodeCredential, DefaultAzureCredential, TokenCredential} from '@azure/identity';
import {AppConfigurationClient} from '@azure/app-configuration';

const AppConfigUrl: string =  'https://appconfig-isazip.azconfig.io';
const RedisHostConfigKey: string = 'redis/hostname';
const RedisAuthnKeyConfigKey: string = 'redis/key';
const StorageNameConfigKey: string = 'storage/name';
const AzDcIPRangeFileConfigKey: string = 'file-azdatacenter-iprange';
const EventHubNameTraceJobAzDcIpFileLoaderConfigKey: string = 'eventhub/jobs-dcipfilesloader-trace/name';
const EventHubNameErrorJobAzDcIpFileLoaderConfigKey: string = 'eventhub/jobs-dcipfilesloader-error/name';
const EventHubNameTraceApiConfigKey: string = 'eventhub/api-trace/name';
const EventHubNameErrorApiConfigKey: string = 'eventhub/api-error/name';
const EventHubConnStringConfigKey: string = 'eventhub/connstring';

export class AppConfiger {

    private client: AppConfigurationClient;
    private azcred: TokenCredential;

    constructor() {

        if(AppConfiger.IsDev()) {
            this.azcred = new VisualStudioCodeCredential();
        } else {
            this.azcred = new DefaultAzureCredential();
        }

        this.client = new AppConfigurationClient(
            AppConfigUrl, // ex: <https://<your appconfig resource>.azconfig.io>
            this.azcred
          );
    }

    GetAzCred(): TokenCredential {
        return this.azcred
    }

    async GetAppConfig(): Promise<AppConfig> {

        try
        {
            const redisHostSetting =
                await this.client.getConfigurationSetting({key: RedisHostConfigKey, label: process.env.env});

            const redisKeySetting =
                await this.client.getConfigurationSetting({key: RedisAuthnKeyConfigKey, label: process.env.env});

            const strgNameSetting =
                await this.client.getConfigurationSetting({key: StorageNameConfigKey, label: process.env.env});

            const fileUrl = await this.client.getConfigurationSetting({key: AzDcIPRangeFileConfigKey});

            const ehnameTraceJobAzDcIpLoader =
                await this.client.getConfigurationSetting({key: EventHubNameTraceJobAzDcIpFileLoaderConfigKey, label: process.env.env});

            const ehnameErrorJobAzDcIpLoader =
                await this.client.getConfigurationSetting({key: EventHubNameErrorJobAzDcIpFileLoaderConfigKey, label: process.env.env});

            const ehnameTraceApi =
                await this.client.getConfigurationSetting({key: EventHubNameTraceApiConfigKey, label: process.env.env});

            const ehnameErrorApi =
                await this.client.getConfigurationSetting({key: EventHubNameErrorApiConfigKey, label: process.env.env});

            const ehConnStr =
                await this.client.getConfigurationSetting({key: EventHubConnStringConfigKey, label: process.env.env});

            return new Promise((resolve) => {
                resolve(new AppConfig
                    (redisHostSetting.value!, redisKeySetting.value!, fileUrl.value!, strgNameSetting.value!,
                        ehnameTraceJobAzDcIpLoader.value!, ehnameErrorJobAzDcIpLoader.value!,
                        ehnameTraceApi.value!, ehnameErrorApi.value!, ehConnStr.value!))
            })
        }
        catch(err) {
            throw err;
        }
    }

    static IsDev(): boolean {
        if(process.env.localdebug && process.env.localdebug == 'true')
            return true;

        return false;
    }
}

export class AppConfig {
    AzDcIPFileUrl: string
    RedisHost: string
    RedisKey: string
    StorageName: string
    EventHubNameTraceJobAzDcIpFileLoader: string
    EventHubNameErrorJobAzDcIpFileLoader: string
    EventHubNameTraceApi: string
    EventHubNameErrorApi: string
    EventHubConnString: string

    constructor(redishost: string, rediskey: string, dcipFileUrl: string, storageName: string,
        eventHubNameTraceJobAzDcIpFileLoader: string, eventHubNameErrorJobAzDcIpFileLoader: string,
        eventHubNameTraceApi: string, EventHubNameErrorApi: string, eventHubConnString: string) {
        this.AzDcIPFileUrl = dcipFileUrl;
        this.RedisHost = redishost;
        this.RedisKey = rediskey;
        this.StorageName = storageName;
        this.EventHubNameTraceJobAzDcIpFileLoader = eventHubNameTraceJobAzDcIpFileLoader;
        this.EventHubNameErrorJobAzDcIpFileLoader = eventHubNameErrorJobAzDcIpFileLoader;
        this.EventHubNameTraceApi = eventHubNameTraceApi;
        this.EventHubNameErrorApi = EventHubNameErrorApi;
        this.EventHubConnString = eventHubConnString;
    }
}