import { WebSocket } from "ws";

class SubscriberManager {

    private _subscribersList: Set<WebSocket>;
    private _operationStack: Array<Array<any>>;
    private _pushStack: Array<object>;
    private _pushingInProcess = false;

    constructor() {
        this._subscribersList = new Set<WebSocket>();
        this._operationStack = [];
        this._pushStack = [];
    }

    addSubscriber(subscriberConnection: WebSocket) {
        if (this._pushingInProcess) {
            this._operationStack.push([this.addSubscriber, subscriberConnection]);
            return;
        }
        this._subscribersList.add(subscriberConnection);
    }

    removeSubscriber(subscriberConnection: WebSocket) {
        if (this._pushingInProcess) {
            this._operationStack.push([this.removeSubscriber, subscriberConnection]);
            return;
        }
        this._subscribersList.delete(subscriberConnection);
    }

    pushData(data: object) {
        if (this._pushingInProcess) {
            this._pushStack.push(data);
            return;
        }
        this._pushingInProcess = true;
        for (const subscriber of this._subscribersList) {
            if (subscriber != null) {
                try {
                    subscriber.send(JSON.stringify(data));
                } catch (e) {
                    subscriber.close();
                    this._operationStack.push([this.removeSubscriber, subscriber]);
                }
            }
        }
        this._pushingInProcess = false;
        while (this._operationStack.length !== 0) {
            const operationToPerform: any[] | undefined = this._operationStack.pop();
            (operationToPerform![0])(operationToPerform![1]);
        }
        while (this._pushStack.length !== 0) {
            const dataToPush: object | undefined = this._pushStack.pop();
            this.pushData(dataToPush!);
        }
    }

}

export default SubscriberManager;