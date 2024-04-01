import { CAMPDB } from "../utils/campdb";
import CookieManager from "./cookieManager";

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
        const requestWasSuccessful = (status?.success != null && status?.success === 1);
        if (requestWasSuccessful) {
            return true;
        } else {
            if (retry) {
                await this.#updateSessionCookie();
            }
            return false;
        }
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

    async getAlumniData(): Promise<boolean | void> {
        let dataFetchToken: string = "";
        return await fetch("https://mujalumni.in/api/search/checkPasswordOnDownload", {
            "headers": {
                "cookie": this.#cookieManager.getCookies(["tz", "lgdomain", "u_i", "c_i", "l_c", "r_v", "mul", "ast_login_id", "encToken", "PHPSESSID"])!,
                "csrf": this.#cookieManager.getCSRFToken()
            },
            "body": `{\"enteredPass\":\"${process.env.MAS_PASS}\"}`,
            "method": "POST"
        }).then(response => {
            response.json().then(status => {
                if (!this.#wasSuccessful(status)) {
                    console.error("DoAR Almashines Alumni Data Fetch Failed.");
                    return false;
                } else {
                    dataFetchToken = status.token;
                    console.log(dataFetchToken);
                    return true;
                }
            });
        }).catch(error => {
            console.error("DoAR Almashines Error: " + error);
            return false;
        });
    }

}

export default AlmaShineManager;