import { WebSocket, Event, ErrorEvent, MessageEvent, CloseEvent } from "ws";
import { Mutex } from "async-mutex";

import SubscriberManager from "./subscriberManager";
import DoARDataManager from "./dataManager";
import AlmaShineManager from "./almashineManager";
import { currentTime, synchronizeCode } from "../utils/common";
import { Document } from "mongodb";

class ATLISManager {

    private _atlisWS!: WebSocket;
    private _connectionCrashed = false;
    private _subscriberManager: SubscriberManager;
    private _dataManager: DoARDataManager;
    private _almashinesManager: AlmaShineManager;

    private _isConnected = false;
    private _connectedOnce = false;

    private _pendingUpdates = 0;

    private _syncAllInProgress = false;
    private _stopSyncAll = false;
    private _syncAllMutex: Mutex;

    constructor(subscriberManager: SubscriberManager, dataManager: DoARDataManager, almashinesManager: AlmaShineManager) {
        this._subscriberManager = subscriberManager;
        this._dataManager = dataManager;
        this._almashinesManager = almashinesManager;
        this._syncAllMutex = new Mutex();
    }

    private _setConnectionStatus(connectionStatus: boolean) {
        this._isConnected = connectionStatus;
    }

    private _connected(): boolean {
        return this._isConnected;
    }

    someSyncingIsGoingOn(): boolean {
        return (this._pendingUpdates !== 0);
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

            this._atlisWS.onerror = async (errorEvent: ErrorEvent) => {
                this._connectionCrashed = true;
                try {
                    if (this._connected()) {
                        console.error("Error ocurred during ATLIS Connection. Retrying to connect...");
                        this._syncAllInProgress = false;
                        await this._dataManager.updateAlumniLIData("", {
                            currentStatus: "nl"
                        });
                        this._pendingUpdates = 0;
                        this._subscriberManager.pushData({
                            type: "liData",
                            error: "ATLIS Engine connection failed or crashed. Please contact %t%"
                        });
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

            this._atlisWS.onclose = async (closeEvent: CloseEvent) => {
                if (this._connectionCrashed) {
                    return;
                }
                try {
                    console.error("ATLIS Connection was closed. Retrying to connect...");
                    this._syncAllInProgress = false;
                    await this._dataManager.updateAlumniLIData("", {
                        currentStatus: "nl"
                    });
                    this._pendingUpdates = 0;
                    this._subscriberManager.pushData({
                        type: "liData",
                        error: "ATLIS Engine connection closed. Please contact %t%"
                    });
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
                this._pendingUpdates--;
                const messageString = messageEvent.data.toString();
                if (messageString === "DM") {
                    return;
                }
                const data: any = JSON.parse(messageString);
                if (data == null) {
                    return;
                }
                const alumniLI = Object.keys(data)[0];
                const alumniId = await this._dataManager.getAlumniIDFromLI(alumniLI);
                if (alumniId !== "") {
                    const toUpdate: any = {
                        currentStatus: "nl"
                    };
                    if (!data[alumniLI].error) {
                        toUpdate["latestStatus"] = "s";
                        toUpdate["lastUpdated"] = currentTime();
                    } else {
                        toUpdate["latestStatus"] = "f";
                    }
                    await this._dataManager.updateAlumniLIData(alumniId, toUpdate);
                    this._subscriberManager.pushData({
                        type: "liData"
                    });
                }
            }
        });
    }

    async fetchLIData(alumniLI: string, alumniId: string, sourceWebSocketConnection: WebSocket) {
        if (!this._connected()) {
            this._syncAllInProgress = false;
            try {
                sourceWebSocketConnection.send(JSON.stringify({
                    type: "liData",
                    error: "ATLIS Engine is not connected. Please contact %t%"
                }));
            } catch (error) {
            } finally {
                return;
            }
        }
        if (!(await this._dataManager.currentAlumniDataIsEligibleForSyncing())) {
            sourceWebSocketConnection.send(JSON.stringify({
                type: "liData",
                error: `Alumni data is outdated i.e. the Alumni Data was updated more than 7 days ago. Please update the alumni data by clicking on the "Update Alumni Data" button, and then try again once the data has been updated. If the issue still persists, please contact %t%`
            }));
        }
        if (this._atlisWS != null) {
            try {
                this._atlisWS.send(`${alumniLI}[%ATLIS%]N`);
                await this._dataManager.updateAlumniLIData(alumniId, {
                    currentStatus: "l"
                });
                this._subscriberManager.pushData({
                    type: "liData"
                });
                this._pendingUpdates++;
            } catch (e) {
                sourceWebSocketConnection.send(JSON.stringify({
                    type: "liData",
                    error: "Failed to connect to ATLIS Engine and process Alumni Data Update Request. Please try again after some time or contact %t%"
                }));
            }
        }
    }

    async fetchAllLIData(sourceWebSocketConnection: WebSocket) {
        if (!this._connected()) {
            try {
                sourceWebSocketConnection.send(JSON.stringify({
                    type: "liData",
                    error: "ATLIS Engine is not connected. Please contact %t%"
                }));
            } catch (error) {
            } finally {
                return;
            }
        }
        if (!this._syncAllInProgress && !(await this._dataManager.currentAlumniDataIsEligibleForSyncing())) {
            sourceWebSocketConnection.send(JSON.stringify({
                type: "liData",
                error: `Alumni data is outdated i.e. the Alumni Data was updated more than 7 days ago. Please update the alumni data by clicking on the "Update Alumni Data" button, and then try again once the data has been updated. If the issue still persists, please contact %t%`
            }));
        }
        const alumniList: Document[] = await this._dataManager.getAllAlumniIDsandLIs();
        if (alumniList == null || alumniList.length === 0) {
            sourceWebSocketConnection.send(JSON.stringify({
                type: "liData",
                error: "Unable to fetch Alumni List. Please try again after some time or contact %t%"
            }));
        }
        this._syncAllInProgress = true;
        this._subscriberManager.pushData({
            type: "successMessage",
            message: `Successfully started "Sync All Alumni Data" operation`
        });
        for (var i = 0; i < alumniList.length; i++) {
            await synchronizeCode(this._syncAllMutex, async () => {
                if (!this._syncAllInProgress) {
                    this._stopSyncAll = true;
                } else {
                    const alumniLI = alumniList[i]["linkedin"];
                    const alumniId = alumniList[i]["alumniId"];
                    if (alumniLI != null || alumniId != null) {
                        await this.fetchLIData(alumniLI, alumniId, sourceWebSocketConnection);
                    }
                }
            });
            if (this._stopSyncAll) {
                this._stopSyncAll = false;
                break;
            }
        }
    }

    async stopSyncingAll() {
        await synchronizeCode(this._syncAllMutex, async () => {
            this._syncAllInProgress = false;
            if (this._atlisWS != null) {
                try {
                    this._atlisWS.send(`stop`);
                } catch (e) {}
            }
            await this._dataManager.updateAlumniLIData("", {
                currentStatus: "nl"
            });
            this._subscriberManager.pushData({
                type: "liData"
            });
        });
    }

}

export default ATLISManager;