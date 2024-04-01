import { WebSocket } from "ws";

class SubscriberManager {

    #subsribersList: WebSocket[];
    #operationStack: Array<Array<any>>;
    #pushStack: Array<object>;
    #pushingInProcess = false;

    constructor() {
        this.#subsribersList = [];
        this.#operationStack = [];
        this.#pushStack = [];
    }

    addSubscriber(subscriberConnection: WebSocket) {
        if (this.#pushingInProcess) {
            this.#operationStack.push([this.addSubscriber, subscriberConnection]);
            return;
        }
        this.#subsribersList.push(subscriberConnection);
    }

    removeSubscriber(subscriberConnection: WebSocket) {
        if (this.#pushingInProcess) {
            this.#operationStack.push([this.removeSubscriber, subscriberConnection]);
            return;
        }
        this.#subsribersList.splice(this.#subsribersList.indexOf(subscriberConnection), 1);
    }

    pushData(data: object) {
        if (this.#pushingInProcess) {
            this.#pushStack.push(data);
            return;
        }
        this.#pushingInProcess = true;
        for (var i = 0; i < this.#subsribersList.length; i++) {
            if (this.#subsribersList[i] != null) {
                try {
                    this.#subsribersList[i].send(JSON.stringify(data));
                } catch (e) {
                    this.#subsribersList[i].close();
                    this.#operationStack.push([this.removeSubscriber, this.#subsribersList[i]]);
                }
            }
        }
        this.#pushingInProcess = false;
        while (this.#operationStack.length !== 0) {
            const operationToPerform: any[] | undefined = this.#operationStack.pop();
            (operationToPerform![0])(operationToPerform![1]);
        }
        while (this.#pushStack.length !== 0) {
            const dataToPush: object | undefined = this.#pushStack.pop();
            this.pushData(dataToPush!);
        }
    }

}

export default SubscriberManager;