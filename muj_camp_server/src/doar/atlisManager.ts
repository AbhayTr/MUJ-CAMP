import { WebSocket, Event, ErrorEvent, MessageEvent, CloseEvent } from "ws";
import { Mutex } from "async-mutex";
import { Document } from "mongodb";

import SubscriberManager from "./subscriberManager";
import DoARDataManager from "./dataManager";
import AlmaShineManager from "./almashineManager";
import { currentTime, sendMessageToWSClient, synchronizeCode, specialHash } from "../utils/common";

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
                    if (!data[alumniLI].error) {
                        await this._updateAlumniData(alumniId, data[alumniLI]);
                    }
                    this._subscriberManager.pushData({
                        type: "liData"
                    });
                }
            }
        });
    }

    private _extractYear(date: string): string | null {
        const year = new Date(date).getFullYear();
        if (isNaN(year)) {
            return null;
        }
        return String(year);
    }

    private _extractMonth(date: string): string | null {
        const month = new Date(date).getMonth();
        if (isNaN(month)) {
            return null;
        }
        return String(month + 1);
    }

    private _getCompaniesandInstitutionsList(alumniLIData: any): object {
        const result: any = {};

        const currentCompany = alumniLIData.company_name;
        const currentDesignation = alumniLIData.designation;
        const otherWorkCompanies = alumniLIData.experience.map((work: any) => {
            const workData: any = {};
            workData.company = work.company_name.replaceAll(",", " ").replaceAll("-", " ");
            workData.designation = work.designation.replaceAll(",", " ").replaceAll("-", " ");
            workData.fromYear = (work.from === "N.A." || work.from === "") ? null : this._extractYear(work.from);
            workData.fromMonth = (work.from === "N.A." || work.from === "") ? null : this._extractMonth(work.from);
            workData.untilWhen = (work.to === "N.A." || work.to === "") ? "N.A." : work.to;
            workData.toYear = (work.to === "N.A." || work.to === "") ? null : (work.to === "Present" ? "c" : this._extractYear(work.to));
            workData.toMonth = (work.to === "N.A." || work.to === "") ? null : (work.to === "Present" ? "c" : this._extractMonth(work.to));
            return workData;
        });
        const allCompanies = [
            {
                company: currentCompany,
                designation: currentDesignation,
                fromYear: null,
                fromMonth: null,
                untilWhen: "c",
                toYear: "c",
                toMonth: "c"
            },
            ...otherWorkCompanies
        ];
        if (currentCompany === "N.E.") {
            allCompanies.splice(0, 1);
        }
        result.companies = allCompanies;

        result.institutions = alumniLIData.education.map((education: any) => {
            const educationData: any = {};
            educationData.institute = education.institution_name.replaceAll(",", " ").replaceAll("-", " ");
            educationData.degree = education.program.replaceAll(",", " ").replaceAll("-", " ");
            educationData.from = (education.from === "N.A." || education.from === "") ? null : education.from.replaceAll(",", " ").replaceAll("-", " ");
            educationData.to = (education.to === "N.A." || education.to === "") ? null : education.to.replaceAll(",", " ").replaceAll("-", " ");
            return educationData;
        });

        return result;
    }

    private _valueInArray(array: Array<string>, value: string): boolean {
        value = value.toLowerCase();
        for (var i = 0; i < array.length; i++) {
            const valAtI = array[i];
            if (valAtI.toLowerCase() === value) {
                return true;
            }
        }
        return false;
    }

    private _stringsInEachOther(string1: string, string2: string): boolean {
        return (string1.indexOf(string2) !== -1) || (string2.indexOf(string1) !== -1);
    };

    private _isNewLocation(existingAlumniData: any, alumniData: any): boolean {
        return (
            alumniData.location != null && 
            alumniData.location.replaceAll(" ", "") !== "" && 
            alumniData.location != "N.A."
        ) && (
            existingAlumniData.location == null || 
            existingAlumniData.location.replaceAll(" ", "") === "" || 
            existingAlumniData.location === "N.A." || 
            !this._stringsInEachOther(
                existingAlumniData.location
                .toLowerCase()
                .replaceAll(",", "")
                .replaceAll("-", "")
                .replaceAll(" ", "")
            ,
                alumniData.location
                .toLowerCase()
                .replaceAll(",", "")
                .replaceAll("-", "")
                .replaceAll(" ", "")
            )
        );
    }

    private async _updateAlumniData(alumniId: string, alumniData: any) {
        const existingAlumniData: any = await this._dataManager.getAlumniCompaniesInstitutionsAndLocation(alumniId);
        const newAlumniLIData: any = this._getCompaniesandInstitutionsList(alumniData);
        const newAlumniData: any = {
            companies: [],
            institutions: []
        };
        for (var i = 0; i < newAlumniLIData.companies.length; i++) {
            const company = newAlumniLIData.companies[i].company;
            const designation = newAlumniLIData.companies[i].designation;
            if (!this._valueInArray(existingAlumniData.companies, specialHash(company, designation))) {
                newAlumniData.companies.push(newAlumniLIData.companies[i]);
            }
        }
        for (var j = 0; j < newAlumniLIData.institutions.length; j++) {
            const institute = newAlumniLIData.institutions[j].institute;
            const degree = newAlumniLIData.institutions[j].degree;
            if (!this._valueInArray(existingAlumniData.institutions, specialHash(institute, degree))) {
                newAlumniData.institutions.push(newAlumniLIData.institutions[j]);
            }
        }
        await this._updateAlmashineData(alumniId, newAlumniData);
        await this._updateDBData(alumniId, newAlumniData);
        if (this._isNewLocation(existingAlumniData, alumniData)) {
            await this._almashinesManager.updateAlumniLocation(alumniId, (alumniData.location || "N.A."));
            await this._dataManager.updateAlumniLocation(alumniId, (alumniData.location || "N.A."), alumniData.country);
        }
    }

    private async _updateAlmashineData(alumniId: string, newAlumniData: any) {
        for (var i = 0; i < newAlumniData.companies.length; i++) {
            await this._almashinesManager.addAlumniWorkExperience(alumniId, newAlumniData.companies[i])
        }
        for (var j = 0; j < newAlumniData.institutions.length; j++) {
            await this._almashinesManager.addAlumniEducation(alumniId, newAlumniData.institutions[j]);
        }
    }

    private async _updateDBData(alumniId: string, newAlumniData: any) {
        for (var i = 0; i < newAlumniData.companies.length; i++) {
            await this._dataManager.addAlumniWorkExperience(alumniId, newAlumniData.companies[i])
        }
        for (var j = 0; j < newAlumniData.institutions.length; j++) {
            await this._dataManager.addAlumniEducation(alumniId, newAlumniData.institutions[j]);
        }
    }

    async fetchLIData(alumniLI: string, alumniId: string, sourceWebSocketConnection: WebSocket) {
        if (!this._connected()) {
            this._syncAllInProgress = false;
            try {
                sendMessageToWSClient(sourceWebSocketConnection, {
                    type: "liData",
                    error: "ATLIS Engine is not connected. Please contact %t%"
                });
            } catch (error) {
            } finally {
                return;
            }
        }
        if (!(await this._dataManager.currentAlumniDataIsEligibleForSyncing())) {
            sendMessageToWSClient(sourceWebSocketConnection, {
                type: "liData",
                error: `Alumni data is outdated i.e. the Alumni Data was updated more than 7 days ago. Please update the alumni data by clicking on the "Update Alumni Data" button, and then try again once the data has been updated. If the issue still persists, please contact %t%`
            });
            return;
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
                sendMessageToWSClient(sourceWebSocketConnection, {
                    type: "liData",
                    error: "Failed to connect to ATLIS Engine and process Alumni Data Update Request. Please try again after some time or contact %t%"
                });
            }
        }
    }

    async fetchAllLIData(sourceWebSocketConnection: WebSocket) {
        if (!this._connected()) {
            try {
                sendMessageToWSClient(sourceWebSocketConnection, {
                    type: "liData",
                    error: "ATLIS Engine is not connected. Please contact %t%"
                });
            } catch (error) {
            } finally {
                return;
            }
        }
        if (!this._syncAllInProgress && !(await this._dataManager.currentAlumniDataIsEligibleForSyncing())) {
            sendMessageToWSClient(sourceWebSocketConnection, {
                type: "liData",
                error: `Alumni data is outdated i.e. the Alumni Data was updated more than 7 days ago. Please update the alumni data by clicking on the "Update Alumni Data" button, and then try again once the data has been updated. If the issue still persists, please contact %t%`
            });
        }
        const alumniList: Document[] = await this._dataManager.getAllAlumniIDsandLIs();
        if (alumniList == null || alumniList.length === 0) {
            sendMessageToWSClient(sourceWebSocketConnection, {
                type: "liData",
                error: "Unable to fetch Alumni List. Please try again after some time or contact %t%"
            });
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