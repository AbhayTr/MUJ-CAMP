import { WebSocket } from "ws";

import { sendMessageToWSClient } from "../utils/common";

class SubscriberManager {

    private _subscribersList: Set<WebSocket>;

    constructor() {
        this._subscribersList = new Set<WebSocket>();
    }

    addSubscriber(subscriberConnection: WebSocket) {
        this._subscribersList.add(subscriberConnection);
    }

    removeSubscriber(subscriberConnection: WebSocket) {
        this._subscribersList.delete(subscriberConnection);
    }

    pushData(data: object) {
        for (const subscriber of this._subscribersList) {
            if (subscriber != null) {
                try {
                    sendMessageToWSClient(subscriber, data);
                } catch (e) {
                    subscriber.close();
                    this.removeSubscriber(subscriber);
                }
            }
        }
    }

}

export default SubscriberManager;