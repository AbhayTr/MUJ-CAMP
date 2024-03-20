import { Application } from "express";
import WebSocket, { WebSocketServer } from "ws";
import CAMPAuthManager from "./auth/auth";
import SubscriberManager from "./utils/subscriberManager";

let app: Application;
let subscriberManager: SubscriberManager = new SubscriberManager();

const setApp = (expressApp: Application) => {
    app = expressApp;
}

const publishMessage = (data: object) => {
    subscriberManager.pushData(data);
}

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
                if (jsonData.type === "init") {
                    ws.send(JSON.stringify({
                        type: "data",
                        pages: 4,
                        headers: [
                            "Test1",
                            "Test2",
                            "Test3",
                        ],
                        data: [
                            [
                                "ValueA1",
                                "ValueA2",
                                "ValueA3",
                            ],
                            [
                                "ValueB1",
                                "ValueB2",
                                "ValueB3",
                            ],
                            [
                                "ValueC1",
                                "ValueC2",
                                "ValueC3",
                            ],
                            [
                                "ValueD1",
                                "ValueD2",
                                "ValueD3",
                            ],
                            [
                                "ValueE1",
                                "ValueE2",
                                "ValueE3",
                            ],
                            [
                                "ValueF1",
                                "ValueF2",
                                "ValueF3",
                            ]
                        ],
                        filters: {
                            "Test1": [
                                ["Value1", 2],
                                ["Value2", 3],
                                ["Value3", 4]
                            ]
                        }
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

export { setApp, publishMessage };