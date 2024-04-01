import { Document } from "mongodb";

import { CAMPCollection, CAMPDB } from "./campdb";

class CookieManager {
    
    #cookieString: string = "";
    #cookieData: any = {};
    #csrfToken: string | null = "";

    #campdb!: CAMPDB;

    constructor(campdb: CAMPDB) {
        this.#campdb = campdb;
    }

    async startSession() {
        const doarCollection: CAMPCollection = this.#campdb.collection("doar");
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
                this.#cookieData = almaShineCookies[0]["cookies"];
                this.#csrfToken = almaShineCookies[0]["csrf"];
                console.log("DoAR Almashines Login Successful (Cached Cookies).");
            }
        }
    }

    #parseCookiesFromString(cookieString: string): any {
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

    async #updateCookiesInDB() {
        const doarCollection: CAMPCollection = this.#campdb.collection("doar");
        const result = await doarCollection.updateOne({
            desc: "AlmaShine Cookies"
        }, {
            $set: {
                desc: "AlmaShine Cookies",
                cookies: this.#cookieData,
                csrf: this.#csrfToken
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
        if (this.#cookieString === "") {
            this.#cookieString += cookieString;
        } else {
            this.#cookieString += (", " + cookieString);
        }
        this.#cookieData = this.#parseCookiesFromString(this.#cookieString);
        if (csrfToken != null) {
            this.#csrfToken = csrfToken;
        }
        this.#updateCookiesInDB();
    }

    #getAllCookies(): string {
        const cookieKeys: string[] = Object.keys(this.#cookieData);
        var cookieString: string = "";
        for (var i = 0; i < cookieKeys.length; i++) {
            cookieString += `${cookieKeys[i]}=${this.#cookieData[cookieKeys[i]]}`
            if (i !== cookieKeys.length - 1) {
                cookieString += ", ";
            }
        }
        return cookieString;
    }

    #getSpeceficCookies(speceficKeys: string[]): string {
        var cookieString: string = "";
        for (var i = 0; i < speceficKeys.length; i++) {
            cookieString += `${speceficKeys[i]}=${this.#cookieData[speceficKeys[i]]}`
            if (i !== speceficKeys.length - 1) {
                cookieString += ", ";
            }
        }
        return cookieString;
    }

    getCookies(speceficKeys: string[] = []): string {
        if (speceficKeys.length === 0) {
            return this.#getAllCookies();
        } else {
            return this.#getSpeceficCookies(speceficKeys);
        }
    }

    getCSRFToken(): string {
        return this.#csrfToken!;
    }
    
}

export default CookieManager;