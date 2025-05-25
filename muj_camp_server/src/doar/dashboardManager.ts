import { Document } from "mongodb";
import { Response } from "express";
import { nanoid } from "nanoid";

import { CAMPCollection, CAMPDB } from "../utils/campdb";
import { currentTime } from "../utils/common";
import AIManager from "./aiManager";
import CAMPRequest from "../utils/CAMPRequest";

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

    async executeQuery(query: object): Promise<any> {
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
                    "error": `
                    The following result is comming after execution of query:

                    ${JSON.stringify(result)}

                    Which does not match the required format.
                    `
                };
            }
            return result["cursor"]["firstBatch"][0];
        } catch (e) {
            return {
                "error": e
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
                const queryResult: any = await this.executeQuery(listOfVisuals[i].query);
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

    private async _storeNewVisual(newQuery: object, prompt: string): Promise<string> {
        const newId = this._generateNewID();
        await this._doarDashboardCollection.insertOne({
            visualId: newId,
            prompt: prompt,
            query: newQuery
        });
        return newId;
    }

    async createNewVisual(req: CAMPRequest, res: Response) {
        const promptBody = req.body;
        const prompt = promptBody.prompt;
        if (prompt == null || prompt === "") {
            res.status(422).send(null);
            return;
        }
        const newQuery: any = await AIManager.getQuery(this, prompt);
        if (!newQuery.error) {
            const queryResult: any = await this.executeQuery(newQuery);
            if (!queryResult["error"]) {
                const newId = await this._storeNewVisual(newQuery, prompt);
                queryResult["visualId"] = newId;
            }
            res.send(queryResult);
        } else {
            res.send({
                "error": newQuery.error
            });
        }
    }

    async deleteVisual(req: CAMPRequest, res: Response) {
        const requestBody = req.body;
        const visualId = requestBody.visualId;
        if (visualId == null || visualId === "") {
            res.status(422).send(null);
            return;
        }
        const result = await this._doarDashboardCollection.deleteOne({
            visualId: visualId
        });
        if (result.deletedCount > 0) {
            res.send({
                "status": "s"
            });
        } else {
            res.send({
                "status": "f"
            });
        }
    }

    private async _getPrevPrompt(visualId: string): Promise<string> {
        const promptData: Document[] = await (await this._doarDashboardCollection.find({
            visualId: visualId
        })).project({
            prompt: 1
        }).toArray();
        if (promptData == null || promptData.length === 0 || promptData[0] == null || promptData[0].prompt == null) {
            return "";
        } else {
            return promptData[0].prompt;
        }
    }

    async updateVisual(req: CAMPRequest, res: Response) {
        const requestBody = req.body;
        const prompt = requestBody.prompt;
        const visualId = requestBody.visualId;
        if (prompt == null || prompt === "" || visualId == null || visualId === "") {
            res.status(422).send(null);
            return;
        }
        const prevPrompt = await this._getPrevPrompt(visualId);
        if (prevPrompt === "") {
            res.status(500).send(null);
            return;
        }
        const newQuery: any = await AIManager.getQuery(this, prompt, prevPrompt);
        if (!newQuery.error) {
            const queryResult: any = await this.executeQuery(newQuery);
            res.send(queryResult);
        } else {
            res.send({
                "error": newQuery.error
            });
        }
    }

}

export default DOARDashboardManager;