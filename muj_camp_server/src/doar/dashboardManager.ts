import { Document } from "mongodb";
import { Response } from "express";
import { nanoid } from "nanoid";

import { CAMPCollection, CAMPDB } from "../utils/campdb";
import { currentTime } from "../utils/common";

class DOARDashboardManager {

    private _campdb: CAMPDB;
    private _doarDashboardCollection!: CAMPCollection;

    constructor(campdb: CAMPDB) {
        this._campdb = campdb;
        this._doarDashboardCollection = this._campdb.collection("doar_dashboard");
    }

    private _generateNewID(): string {
        return nanoid() + String(currentTime());
    }

    private async _executeQuery(query: object): Promise<any> {
        try {
            const result = await this._campdb.command(query);
            if (
                result == null || 
                result["cursor"] == null || 
                result["cursor"]["firstBatch"] == null || 
                result["cursor"]["firstBatch"][0] == null || 
                result["ok"] == null || 
                result["ok"] !== 1
            ) {
                return {
                    "error": "np"
                };
            }
            return result["cursor"]["firstBatch"][0];
        } catch (e) {
            return {
                "error": "np"
            };
        }
    }

    private async _fetchListOfVisuals(): Promise<object> {
        const listOfVisuals: Document[] = await (await this._doarDashboardCollection.find({
        })).project({
            query: 1,
            visualId: 1
        }).toArray();
        if (listOfVisuals == null || listOfVisuals.length === 0) {
            return {
                "visuals": []
            }
        } else {
            const newListOfVisuals = [];
            for (var i = 0; i < listOfVisuals.length; i++) {
                if (listOfVisuals[i] == null || listOfVisuals[i].query == null || listOfVisuals[i].visualId == null) {
                    continue;
                }
                const queryResult: any = await this._executeQuery(listOfVisuals[i].query);
                if (!queryResult["error"]) {
                    queryResult["visualId"] = listOfVisuals[i].visualId;
                    newListOfVisuals.push(queryResult);   
                }
            }
            return {
                "visuals": newListOfVisuals
            };
        }
    }

    async handleVisualsListRequest(res: Response) {
        res.send(await this._fetchListOfVisuals());
    }

}

export default DOARDashboardManager;