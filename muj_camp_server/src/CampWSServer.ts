import { Application } from "express";
import WebSocket, { WebSocketServer } from "ws";
import { Mutex } from "async-mutex";

import CAMPAuthManager from "./auth/auth";
import SubscriberManager from "./doar/subscriberManager";
import AlmaShineManager from "./doar/almashineManager";
import DoARDataManager from "./doar/dataManager";
import ATLISManager from "./doar/atlisManager";
import { synchronizeCode } from "./utils/common";

let subscriberManager: SubscriberManager = new SubscriberManager();
let almashineManager: AlmaShineManager;
let dataManager: DoARDataManager;
let dataIsBeingFetched = false;
let atlisManager: ATLISManager;

const alumniDataUpdateMutex: Mutex = new Mutex();

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
                        ws.send(JSON.stringify({
                            type: "initDataUpdate",
                            dataIsBeingFetched: dataIsBeingFetched
                        }));
                    } else if (jsonData.type === "data") {
                        const page = jsonData.page;
                        const searchText = jsonData.search.replace(/[^a-zA-Z0-9, -]/g, "");
                        const appliedFilters = jsonData.filters;
                        const homeData: any = await dataManager.getAlumniDataSet(searchText, page, appliedFilters);
                        ws.send(JSON.stringify({
                            type: "data",
                            pages: homeData.pages,
                            headers: homeData.headers,
                            data: homeData.data,
                            filters: await dataManager.getHomeFilters(appliedFilters, searchText),
                            records: homeData.records
                        }));
                    } else if (jsonData.type === "dataUpdate") {
                        await synchronizeCode(alumniDataUpdateMutex, async () => {
                            if (dataIsBeingFetched) {
                                ws.send(JSON.stringify({
                                    type: "dataUpdate",
                                    dataIsBeingFetched: dataIsBeingFetched
                                }));
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
                                    status: fetchStatus
                                });
                            }
                        });
                    } else if (jsonData.type === "fetchLIData") {
                        atlisManager.fetchLIData(jsonData.linkedin);
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