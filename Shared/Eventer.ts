import {EventHubProducerClient} from '@azure/event-hubs'

export default class Eventer {

    eventhubName: string;
    connstring: string;
    producer: EventHubProducerClient;

    constructor(eventhubName: string, connstring: string) {
        this.eventhubName = eventhubName;
        this.connstring = connstring;
        this.producer =  new EventHubProducerClient(connstring, eventhubName);
    }

    async Publish(msg: string): Promise<any> {

        const batchMsg = await this.producer.createBatch();

        batchMsg.tryAdd({body: msg});

        return new Promise(async (resolve, reject) => {
            try
            {
                await this.producer.sendBatch(batchMsg);
            }
            catch(err) {
                reject(err);
            }
        })
    }
}