import { Application } from "express";
import WebSocket, { WebSocketServer } from "ws";
import { Mutex } from "async-mutex";

import CAMPAuthManager from "./auth/auth";
import SubscriberManager from "./doar/subscriberManager";
import AlmaShineManager from "./doar/almashineManager";
import DoARDataManager from "./doar/dataManager";
import ATLISManager from "./doar/atlisManager";
import { sendMessageToWSClient, synchronizeCode } from "./utils/common";

let subscriberManager: SubscriberManager = new SubscriberManager();
let almashineManager: AlmaShineManager;
let dataManager: DoARDataManager;
let dataIsBeingFetched = false;
let atlisManager: ATLISManager;

const alumniOpsExclusivityMutex: Mutex = new Mutex();

async function startAlmashinesSession() {
    await almashineManager.startSession();
}

const startWSServer = async (app: Application) => {
    dataManager = new DoARDataManager(app.locals.campdbDoar);
    almashineManager = new AlmaShineManager(app.locals.campdbDoar, dataManager);
    await startAlmashinesSession();
    atlisManager = new ATLISManager(subscriberManager, dataManager, almashineManager);
    await atlisManager.startSession();
    
    const wss: WebSocketServer = new WebSocketServer({
        port: parseInt(process.env.WS_PORT!)
    });
    
    wss.on("connection", (ws: WebSocket) => {
        
        ws.on("message", async (data: string) => {
            let jsonData: any = {};
            try {
                jsonData = JSON.parse(data);
                const authData = jsonData.auth;
                jsonData = jsonData.data;
                if (await CAMPAuthManager.validateTokenWS(authData.authToken, authData.authEmail, app)) {
                    if (jsonData.type === "init") {
                        subscriberManager.addSubscriber(ws);
                        sendMessageToWSClient(ws, {
                            type: "initDataUpdate",
                            dataIsBeingFetched: dataIsBeingFetched,
                            updateTime: await dataManager.getAlumniDataLastUpdatedTime()
                        });
                    } else if (jsonData.type === "data") {
                        try {
                            const page = jsonData.page;
                            const searchText = jsonData.search.replace(/[^a-zA-Z0-9, -]/g, "");
                            const filtersApplied = jsonData.filters;
                            const homeData: any = await dataManager.getAlumniDataSet(searchText, page, filtersApplied);
                            sendMessageToWSClient(ws, {
                                type: "data",
                                pages: homeData.pages,
                                headers: homeData.headers,
                                data: homeData.data,
                                filters: await dataManager.getHomeFilters(filtersApplied, searchText),
                                records: homeData.records
                            });
                        } catch (e) {
                            sendMessageToWSClient(ws, {
                                type: "data",
                                pages: 0,
                                headers: [],
                                data: [],
                                filters: {},
                                records: 0
                            });
                        }
                    } else if (jsonData.type === "dataUpdate") {
                        await synchronizeCode(alumniOpsExclusivityMutex, async () => {
                            if (!atlisManager.someSyncingIsGoingOn()) {
                                if (dataIsBeingFetched) {
                                    sendMessageToWSClient(ws, {
                                        type: "dataUpdate",
                                        dataIsBeingFetched: dataIsBeingFetched
                                    });
                                } else {
                                    dataIsBeingFetched = true;
                                    subscriberManager.pushData({
                                        type: "dataUpdate",
                                        dataIsBeingFetched: dataIsBeingFetched
                                    });
                                    const fetchStatus = await almashineManager.getAlumniData();
                                    dataIsBeingFetched = false;
                                    subscriberManager.pushData({
                                        type: "dataUpdate",
                                        dataIsBeingFetched: dataIsBeingFetched,
                                        status: fetchStatus,
                                        updateTime: await dataManager.getAlumniDataLastUpdatedTime()
                                    });
                                }
                            } else {
                                sendMessageToWSClient(ws, {
                                    type: "dataUpdate",
                                    dataIsBeingFetched: false,
                                    status: false,
                                    updateTime: await dataManager.getAlumniDataLastUpdatedTime()
                                });
                            }
                        });
                    } else if (jsonData.type === "fetchLIData") {
                        await synchronizeCode(alumniOpsExclusivityMutex, async () => {
                            if (!dataIsBeingFetched) {
                                const alumniLI = await dataManager.getAlumniLI(jsonData.alumniId);
                                if (alumniLI !== "") {
                                    await atlisManager.fetchLIData(alumniLI, jsonData.alumniId, ws);
                                }
                            } else {
                                sendMessageToWSClient(ws, {
                                    type: "liData",
                                    error: "Almashines Data Updation is in progress. Please wait for the data updation to complete and then try again."
                                });
                            }
                        });
                    } else if (jsonData.type === "fetchAllData") {
                        await synchronizeCode(alumniOpsExclusivityMutex, async () => {
                            if (!dataIsBeingFetched) {
                                if (!(await dataManager.currentAlumniDataIsEligibleForSyncing())) {
                                    sendMessageToWSClient(ws, {
                                        type: "liData",
                                        error: `Alumni data is outdated i.e. the Alumni Data was updated more than 7 days ago. Please update the alumni data by clicking on the "Update Alumni Data" button, and then try again once the data has been updated. If the issue still persists, please contact %t%`
                                    });
                                } else {
                                    atlisManager.fetchAllLIData(ws);
                                }
                            } else {
                                sendMessageToWSClient(ws, {
                                    type: "liData",
                                    error: "Almashines Data Updation is in progress. Please wait for the data updation to complete and then try again."
                                });
                            }
                        });
                    } else if (jsonData.type === "stopFetchAllData") {
                        await synchronizeCode(alumniOpsExclusivityMutex, async () => {
                            if (!dataIsBeingFetched) {
                                await atlisManager.stopSyncingAll();
                                subscriberManager.pushData({
                                    type: "successMessage",
                                    message: `Successfully stopped "Sync All Alumni Data" operation`
                                });
                            } else {
                                sendMessageToWSClient(ws, {
                                    type: "liData",
                                    error: "Almashines Data Updation is in progress. Please wait for the data updation to complete and then try again."
                                });
                            }
                        })
                    }
                } else {
                    ws.close()
                }
            } catch (e) {
                ws.close();
                throw e;
            }
        });
    
        ws.on("close", (code: number, reason: Buffer) => {
            subscriberManager.removeSubscriber(ws);
        });
        
    });
}

export default startWSServer;