import { WebSocket, Event, ErrorEvent, MessageEvent, CloseEvent } from "ws";

class ATLISManager {

    private _atlisWS!: WebSocket;
    private _connectionCrashed = false;

    async startSession(): Promise<boolean> {
        return new Promise((resolve) => {
            this._atlisWS = new WebSocket(process.env.ATLIS_ADDRESS!);
            
            this._atlisWS.onopen = (event: Event) => {
                this._connectionCrashed = false;
                console.log("Connected to ATLIS Engine.")
                resolve(true);
            }

            this._atlisWS.onerror = (errorEvent: ErrorEvent) => {
                this._connectionCrashed = true;
                try {
                    console.error("Error ocurred during ATLIS Connection. Retrying to connect...");
                    setTimeout(() => {
                        this.startSession();
                    }, 2000);
                } catch (exception) {
                    console.error("Error ocurred during ATLIS re-Connection. Retrying to connect...");
                    setTimeout(() => {
                        this.startSession();
                    }, 2000);
                }
            }

            this._atlisWS.onclose = (closeEvent: CloseEvent) => {
                if (this._connectionCrashed) {
                    return;
                }
                try {
                    console.error("ATLIS Connection was closed. Retrying to connect...");
                    setTimeout(() => {
                        this.startSession();
                    }, 2000);
                } catch (exception) {
                    console.error("Error ocurred during ATLIS re-Connection after closing. Retrying to connect...");
                    setTimeout(() => {
                        this.startSession();
                    }, 2000);
                }
            }

            this._atlisWS.onmessage = (messageEvent: MessageEvent) => {

            }

        });
    }

}

export default ATLISManager;