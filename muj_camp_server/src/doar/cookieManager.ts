import { Document } from "mongodb";

import { CAMPCollection, CAMPDB } from "../utils/campdb";

class CookieManager {
    
    private _cookieString: string = "";
    private _cookieData: any = {};
    private _csrfToken: string | null = "";

    private _campdb!: CAMPDB;

    constructor(campdb: CAMPDB) {
        this._campdb = campdb;
    }

    async startSession() {
        const doarCollection: CAMPCollection = this._campdb.collection("doar");
        const almaShineCookies: Document[] = await (await doarCollection.find({
            desc: "AlmaShine Cookies"
        })).project({
            cookies: 1,
            csrf: 1
        }).toArray();
        if (almaShineCookies == null || almaShineCookies.length === 0) {
            return;
        } else {
            if (almaShineCookies[0] == null || almaShineCookies[0].length === 0 || almaShineCookies[0]["cookies"] == null || almaShineCookies[0]["csrf"] == null) {
                return;
            } else {
                this._cookieData = almaShineCookies[0]["cookies"];
                this._csrfToken = almaShineCookies[0]["csrf"];
                console.log("DoAR Almashines Login Successful (Cached Cookies).");
            }
        }
    }

    private _parseCookiesFromString(cookieString: string): any {
        let expiryStringFound: boolean = false;
        let expiryStringTrackingString: string = "";
        let cookieDataString: string = "";
        let avoidJustAfterCommaSpace: boolean = false;
        
        const cookiesList: any = {};
        
        for (let i = 0; i < cookieString.length; i++) {
            const char = cookieString[i];
            if (avoidJustAfterCommaSpace && char === " ") {
                avoidJustAfterCommaSpace = false;
                continue;
            } else if (avoidJustAfterCommaSpace) {
                avoidJustAfterCommaSpace = false;
            }
            
            if (char === ";") {
                expiryStringTrackingString = "";
            } else if (char === ",") {
                if (expiryStringFound) {
                    expiryStringFound = false;
                } else {
                    const cookieKey: string = cookieDataString.split("; ")[0].split("=")[0];
                    const cookieValue: string = cookieDataString.split("; ")[0].split("=")[1];
                    cookiesList[cookieKey] = cookieValue;
                    avoidJustAfterCommaSpace = true;
                    cookieDataString = "";
                }
                continue;
            } else if (expiryStringTrackingString.toLowerCase().includes("expires")) {
                expiryStringFound = true;
                expiryStringTrackingString = "";
            }
                        
            cookieDataString += char;
            expiryStringTrackingString += char;
        }

        const cookieKey: string = cookieDataString.split("; ")[0].split("=")[0];
        const cookieValue: string = cookieDataString.split("; ")[0].split("=")[1];
        cookiesList[cookieKey] = cookieValue;
        cookieDataString = "";
        
        return cookiesList;
    }

    private async _updateCookiesInDB() {
        const doarCollection: CAMPCollection = this._campdb.collection("doar");
        const result = await doarCollection.updateOne({
            desc: "AlmaShine Cookies"
        }, {
            $set: {
                desc: "AlmaShine Cookies",
                cookies: this._cookieData,
                csrf: this._csrfToken
            }
        }, {
            upsert: true
        });
        if (!(result.modifiedCount > 0 || result.upsertedCount > 0)) {
            console.error("DoAR Almashines Cookie DB Update Error.");
        }
    }

    updateCookies(cookieString: string, csrfToken: string | null = null) {
        if (cookieString == null) {
            return;
        }
        if (this._cookieString === "") {
            this._cookieString += cookieString;
        } else {
            this._cookieString += (", " + cookieString);
        }
        this._cookieData = this._parseCookiesFromString(this._cookieString);
        if (csrfToken != null) {
            this._csrfToken = csrfToken;
        }
        this._updateCookiesInDB();
    }

    private _getAllCookies(): string {
        const cookieKeys: string[] = Object.keys(this._cookieData);
        var cookieString: string = "";
        for (var i = 0; i < cookieKeys.length; i++) {
            cookieString += `${cookieKeys[i]}=${this._cookieData[cookieKeys[i]]}`
            if (i !== cookieKeys.length - 1) {
                cookieString += ", ";
            }
        }
        return cookieString;
    }

    private _getSpeceficCookies(speceficKeys: string[]): string {
        var cookieString: string = "";
        for (var i = 0; i < speceficKeys.length; i++) {
            cookieString += `${speceficKeys[i]}=${this._cookieData[speceficKeys[i]]}`
            if (i !== speceficKeys.length - 1) {
                cookieString += "; ";
            }
        }
        return cookieString;
    }

    getCookies(speceficKeys: string[] = []): string {
        if (speceficKeys.length === 0) {
            return this._getAllCookies();
        } else {
            return this._getSpeceficCookies(speceficKeys);
        }
    }

    getCSRFToken(): string {
        return this._csrfToken!;
    }
    
}

export default CookieManager;