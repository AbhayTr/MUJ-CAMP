import { WebSocket, Event, ErrorEvent, MessageEvent, CloseEvent } from "ws";

import SubscriberManager from "./subscriberManager";
import DoARDataManager from "./dataManager";
import AlmaShineManager from "./almashineManager";

class ATLISManager {

    private _atlisWS!: WebSocket;
    private _connectionCrashed = false;
    private _subscriberManager: SubscriberManager;
    private _dataManager: DoARDataManager;
    private _almashinesManager: AlmaShineManager;

    private _isConnected = false;
    private _connectedOnce = false;

    constructor(subscriberManager: SubscriberManager, dataManager: DoARDataManager, almashinesManager: AlmaShineManager) {
        this._subscriberManager = subscriberManager;
        this._dataManager = dataManager;
        this._almashinesManager = almashinesManager;
    }

    private _setConnectionStatus(connectionStatus: boolean) {
        this._isConnected = connectionStatus;
    }

    private _connected(): boolean {
        return this._isConnected;
    }

    async startSession(): Promise<void> {
        return new Promise((resolve) => {
            this._atlisWS = new WebSocket(process.env.ATLIS_ADDRESS!);
            
            this._atlisWS.onopen = (event: Event) => {
                this._connectionCrashed = false;
                
                this._setConnectionStatus(true);
                this._connectedOnce = true;
                console.log("Connected to ATLIS Engine.")
                resolve();
            }

            this._atlisWS.onerror = (errorEvent: ErrorEvent) => {
                this._connectionCrashed = true;
                try {
                    if (this._connected()) {
                        console.error("Error ocurred during ATLIS Connection. Retrying to connect...");
                        this._setConnectionStatus(false);   
                    } else if (!this._connectedOnce) {
                        console.log("ATLIS Server not available.");
                        resolve();
                    }
                    if (this._connectedOnce) {
                        setTimeout(() => {
                            this.startSession();
                        }, 2000);
                    }
                } catch (exception) {
                    console.error("Error ocurred during ATLIS re-Connection. Retrying to connect...");
                    this._setConnectionStatus(false);
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
                    this._setConnectionStatus(false);
                    setTimeout(() => {
                        this.startSession();
                    }, 2000);
                } catch (exception) {
                    console.error("Error ocurred during ATLIS re-Connection after closing. Retrying to connect...");
                    this._setConnectionStatus(false);
                    setTimeout(() => {
                        this.startSession();
                    }, 2000);
                }
            }

            this._atlisWS.onmessage = async (messageEvent: MessageEvent) => {
                const data: object = JSON.parse(messageEvent.data.toString());
                if (data == null) {
                    return;
                }
                const alumniLI = Object.keys(data)[0];
                const alumniId = await this._dataManager.getAlumniIDFromLI(alumniLI);
                console.log("Alumni LinkedIn: " + alumniLI);
                console.log("Alumni ID: " + alumniId);
                console.log("Alumni Data: ");
                console.log(data);
            }

        });
    }

    async fetchLIData(alumniLIStatusData: any, alumniId: string, sourceWebSocketConnection: WebSocket) {
        if (!this._connected()) {
            try {
                sourceWebSocketConnection.send(JSON.stringify({
                    type: "liData",
                    alumniId: alumniId,
                    wasSuccessful: false,
                    error: "ATLIS Engine is not connected. Please contact %t%"
                }));
            } catch (error) {}
        }
        if (this._atlisWS != null) {
            try {
                this._atlisWS.send(`${alumniLIStatusData.linkedin}[%ATLIS%]N`);
                delete alumniLIStatusData["linkedin"];
                alumniLIStatusData["currentStatus"] = "l";
                await this._dataManager.updateAlumniLIData(alumniId, alumniLIStatusData);
                this._subscriberManager.pushData({
                    type: "liData",
                    wasSuccessful: true,
                    alumniId: alumniId,
                    liStatus: alumniLIStatusData
                });
            } catch (e) {
                sourceWebSocketConnection.send(JSON.stringify({
                    type: "liData",
                    alumniId: alumniId,
                    wasSuccessful: false,
                    error: "Failed to connect to ATLIS Engine. Please try again after some time or contact %t%"
                }));
            }
        }
    }

}

export default ATLISManager;