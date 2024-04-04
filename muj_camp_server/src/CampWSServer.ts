import { Application } from "express";
import WebSocket, { WebSocketServer } from "ws";

import CAMPAuthManager from "./auth/auth";
import SubscriberManager from "./doar/subscriberManager";
import AlmaShineManager from "./doar/almashineManager";

let subscriberManager: SubscriberManager = new SubscriberManager();
let almashineManager: AlmaShineManager;

async function startAlmashinesSession() {
    await almashineManager.startSession();
    console.log(await almashineManager.getAlumniData());
}

const startWSServer = async (app: Application) => {
    
    almashineManager = new AlmaShineManager(app.locals.campdb);
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
                    subscriberManager.addSubscriber(ws);
                    if (jsonData.type === "init" || jsonData.type === "data") {
                        ws.send(JSON.stringify({
                            type: "data",
                            pages: 104,
                            headers: [
                                "Name",
                                "Current Company",
                                "Current Higher Education",
                                "Profile Status"
                            ],
                            data: [
                                [
                                    "Akshet Patel",
                                    "Smart Power Systems Ltd.",
                                    "UCL London",
                                    `{"lu": ${1}, "ls": "${"s"}", "cs": "${"l"}"}`,
                                ],
                                [
                                    "Akash Bhalotia",
                                    "Google",
                                    "-",
                                    `{"lu": ${1}, "ls": "${"f"}", "cs": "${"nl"}"}`,
                                ],
                                [
                                    "Vanshaj Arora",
                                    "Smollan x Google",
                                    "-",
                                    `{"lu": ${1}, "ls": "${"f"}", "cs": "${"nl"}"}`,
                                ],
                                [
                                    "Rishi Goyal",
                                    "Celebel Technologies",
                                    "-",
                                    `{"lu": ${1}, "ls": "${"f"}", "cs": "${"nl"}"}`,
                                ],
                                [
                                    "XYZ",
                                    "ABC",
                                    "-",
                                    `{"lu": ${2}, "ls": "${"f"}", "cs": "${"nl"}"}`,
                                ]
                            ],
                            filters: {
                                "Test1": [
                                    ["Value1", 2],
                                    ["Value2", 3],
                                    ["Value3", 4]
                                ]
                            },
                            records: 100
                        }));
                    }
                } else {
                    ws.close()
                }
            } catch (e) {
                ws.close();
            }
        });
    
        ws.on("close", (code: number, reason: Buffer) => {
            subscriberManager.removeSubscriber(ws);
        });
        
    });
}

export default startWSServer;