import { Application } from "express";
import WebSocket, { WebSocketServer } from "ws";

import CAMPAuthManager from "./auth/auth";
import SubscriberManager from "./doar/subscriberManager";
import AlmaShineManager from "./doar/almashineManager";
import DoARDataManager from "./doar/dataManager";
import ATLISManager from "./doar/atlisManager";

let subscriberManager: SubscriberManager = new SubscriberManager();
let almashineManager: AlmaShineManager;
let dataManager: DoARDataManager;
let dataIsBeingFetched = false;
let atlisManager: ATLISManager;

async function startAlmashinesSession() {
    await almashineManager.startSession();
}

const startWSServer = async (app: Application) => {
    dataManager = new DoARDataManager(app.locals.campdb);
    atlisManager = new ATLISManager();
    await atlisManager.startSession();
    almashineManager = new AlmaShineManager(app.locals.campdb, dataManager);
    await startAlmashinesSession();
    
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
                    if (jsonData.type === "init" || jsonData.type === "data") {
                        if (jsonData.type === "init") {
                            subscriberManager.addSubscriber(ws);
                            ws.send(JSON.stringify({
                                type: "dataUpdate",
                                dataIsBeingFetched: dataIsBeingFetched
                            }));
                        }
                        const page = (jsonData.type === "init") ? 1 : jsonData.page;
                        const searchText = ((jsonData.type === "init") ? "" : jsonData.search).replace(/[^a-zA-Z0-9, -]/g, "");
                        const appliedFilters = (jsonData.type === "init") ? {} : jsonData.filters;
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