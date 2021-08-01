import {VisualStudioCodeCredential, DefaultAzureCredential, TokenCredential} from '@azure/identity';
import {AppConfigurationClient} from '@azure/app-configuration';

const AppConfigUrl: string =  'https://appconfig-isazip.azconfig.io';
const RedisHostConfigKey: string = 'redis/hostname';
const RedisAuthnKeyConfigKey: string = 'redis/key';
const AzDcIPRangeFileConfigKey: string = 'file-azdatacenter-iprange';
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

    async GetAppConfig(): Promise<AppConfig> {

        try
        {
            const redisHostSetting =
                await this.client.getConfigurationSetting({key: RedisHostConfigKey, label: process.env.env});

            const redisKeySetting =
                await this.client.getConfigurationSetting({key: RedisAuthnKeyConfigKey, label: process.env.env});

            const fileUrl = await this.client.getConfigurationSetting({key: AzDcIPRangeFileConfigKey});

            return new AppConfig(redisHostSetting.value, redisKeySetting.value, fileUrl.value);
        }
        catch(err) {
            throw err;
        }
    }

    static IsDev(): boolean {
        if(process.env.env != undefined && process.env.env == 'dev')
            return true;
        else
            return false;
    }
}

export class AppConfig {
    AzDcIPFileUrl: string
    RedisHost: string
    RedisKey: string

    constructor(redishost: string, rediskey: string, dcipFileUrl: string) {
        this.AzDcIPFileUrl = dcipFileUrl;
        this.RedisHost = redishost;
        this.RedisKey = rediskey;
    }
}