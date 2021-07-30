import {VisualStudioCodeCredential, DefaultAzureCredential, TokenCredential} from '@azure/identity';
import {AppConfigurationClient} from '@azure/app-configuration';

const AppConfigUrl: string =  'https://appconfig-isazip.azconfig.io';
const RedisConfigKey: string = 'redis-connstring';
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
            const redisSetting =
            await this.client.getConfigurationSetting({key: RedisConfigKey, label: process.env.env});

            const fileUrl = await this.client.getConfigurationSetting({key: AzDcIPRangeFileConfigKey});

            return new AppConfig(redisSetting.value, fileUrl.value);
        }
        catch(err) {
            console.log(err);
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
    RedisConnString: string

    constructor(redisConn: string, dcipFileUrl: string) {
        this.AzDcIPFileUrl = dcipFileUrl;
        this.RedisConnString = redisConn;
    }
}