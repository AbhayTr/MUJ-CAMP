import fs from "fs";
import https from "https";
import { Transform } from "stream";

import { CAMPDB } from "../utils/campdb";
import CookieManager from "./cookieManager";

class FileCleaner extends Transform {
    
    private _buff: string = "";
    private _removed: number = 0;

    constructor(args?: any) {
        super(args);
    }

    _transform(chunk: Buffer, encoding: BufferEncoding, done: (error?: Error | null) => void) {
        if (this._removed == 2) {
            this.push(chunk);
        } else {
            this._buff += chunk;
            if (this._buff.indexOf("\n") !== -1) {
                if (this._removed === 1) {
                    this.push(this._buff.slice(this._buff.indexOf("\n") + 1));
                    this._buff = "";
                    this._removed = 2;
                } else {
                    this._buff = this._buff.slice(this._buff.indexOf("\n") + 1)
                    if (this._buff.indexOf("\n") !== -1) {
                        this.push(this._buff.slice(this._buff.indexOf("\n") + 1));
                        this._buff = "";
                        this._removed = 2;
                    } else {
                        this._removed = 1;
                    }
                }
            }
        }
        done(); 
    }

}

class AlmaShineManager {

    #cookieManager: CookieManager;
 
    constructor(campdb: CAMPDB) {
        this.#cookieManager = new CookieManager(campdb);
    }

    #extractCSRFToken(text: string): string {
        var regex = /"csrf_token":"(\w{32})"/;
        var match = text.match(regex);
        if (match) {
            return match[1];
        } else {
            regex = /"csrf_token": "(\w{32})"/;
            match = text.match(regex);
            if (match) {
                return match[1];
            } else {
                return "";
            }
        }
    }

    async #wasSuccessful(status: any, retry: boolean = true): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const requestWasSuccessful = (status?.success != null && status?.success === 1);
            if (requestWasSuccessful) {
                resolve(true);
            } else {
                if (retry) {
                    await this.#updateSessionCookie();
                }
                resolve(false);
            }
        });
    }

    async startSession() {
        await this.#cookieManager.startSession();
        if (this.#cookieManager.getCookies() === "") {
            await this.#updateSessionCookie();
        }
    }

    async #updateSessionCookie() {
        await fetch("https://mujalumni.in/account?cid=359")
        .then(async (response) => {
            await response.text().then(text => {
                this.#cookieManager.updateCookies(response.headers.get("set-cookie")!, this.#extractCSRFToken(text));
                if (this.#cookieManager.getCSRFToken() === "") {
                    console.error("DoAR Almashines Unable to fetch CSRF Token.");
                }
            });
        });
        await this.#updatePHPSessionCookie();
    }

    async #updatePHPSessionCookie() {
        await fetch("https://mujalumni.in/api/institutes/getSocialSignupUrls/1", {
            "headers": {
                "cookie": this.#cookieManager.getCookies(["encToken"])!,
                "csrf": this.#cookieManager.getCSRFToken()
            },
            "method": "POST"
        })
        .then(response => {
            this.#cookieManager.updateCookies(response.headers.get("set-cookie")!);
        });
        await this.#login();
    }

    async #login() {
        await fetch("https://mujalumni.in/api/login/loginUser", {
            "headers": {
                "cookie": this.#cookieManager.getCookies(["tz", "encToken",  "PHPSESSID"])!,
                "csrf": this.#cookieManager.getCSRFToken()
            },
            "body": `{\"email\":\"${process.env.MAS_MAIl}\",\"password\":\"${process.env.MAS_PASS}\",\"force_signup_cid\":\"359\"}`,
            "method": "POST"
        }).then(response => {
            this.#cookieManager.updateCookies(response.headers.get("set-cookie")!);
            response.json().then(status => {
                if (!this.#wasSuccessful(status, false)) {
                    console.error("DoAR Almashines Login Failed.");
                } else {
                    console.log("DoAR Almashines Login Successful (New Cookies).");
                }
            });
        });
    }

    async #fetchAlumniData(token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            https.get(`https://mujalumni.in/api/search/download_new/Search%20by%20Role%20%3A%20Alumni?role%5B0%5D=2&other_params[fetch_lost]=true&other_params[viewName]=directory&token=${token}`, {
                headers: {
                    cookie: this.#cookieManager.getCookies(["tz", "lgdomain", "u_i", "c_i", "l_c", "r_v", "mul", "ast_login_id", "encToken", "PHPSESSID"])!
                }
            }, fileData => {
                const alumniDataFile = fs.createWriteStream("./data/alumni_data.csv", {
                    flags: "w"
                });
                fileData
                .pipe(new FileCleaner())
                .pipe(alumniDataFile);
                resolve();
            });
        });
    }

    async getAlumniData(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fetch("https://mujalumni.in/api/search/checkPasswordOnDownload", {
                "headers": {
                    "cookie": this.#cookieManager.getCookies(["tz", "lgdomain", "u_i", "c_i", "l_c", "r_v", "mul", "ast_login_id", "encToken", "PHPSESSID"])!,
                    "csrf": this.#cookieManager.getCSRFToken()
                },
                "body": `{\"enteredPass\":\"${process.env.MAS_PASS}\"}`,
                "method": "POST"
            }).then(response => {
                response.json().then(async status => {
                    if (!await this.#wasSuccessful(status, false)) {
                        console.error("DoAR Almashines Alumni Data Fetch Failed.");
                        resolve(false);
                    } else {
                        await this.#fetchAlumniData(status.token);
                        resolve(true);
                    }
                });
            }).catch(error => {
                console.error("DoAR Almashines Error: " + error);
                resolve(false);
            });
        });
    }

}

export default AlmaShineManager;