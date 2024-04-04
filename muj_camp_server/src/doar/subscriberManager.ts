import { WebSocket } from "ws";

class SubscriberManager {

    private _subsribersList: WebSocket[];
    private _operationStack: Array<Array<any>>;
    private _pushStack: Array<object>;
    private _pushingInProcess = false;

    constructor() {
        this._subsribersList = [];
        this._operationStack = [];
        this._pushStack = [];
    }

    addSubscriber(subscriberConnection: WebSocket) {
        if (this._pushingInProcess) {
            this._operationStack.push([this.addSubscriber, subscriberConnection]);
            return;
        }
        this._subsribersList.push(subscriberConnection);
    }

    removeSubscriber(subscriberConnection: WebSocket) {
        if (this._pushingInProcess) {
            this._operationStack.push([this.removeSubscriber, subscriberConnection]);
            return;
        }
        this._subsribersList.splice(this._subsribersList.indexOf(subscriberConnection), 1);
    }

    pushData(data: object) {
        if (this._pushingInProcess) {
            this._pushStack.push(data);
            return;
        }
        this._pushingInProcess = true;
        for (var i = 0; i < this._subsribersList.length; i++) {
            if (this._subsribersList[i] != null) {
                try {
                    this._subsribersList[i].send(JSON.stringify(data));
                } catch (e) {
                    this._subsribersList[i].close();
                    this._operationStack.push([this.removeSubscriber, this._subsribersList[i]]);
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