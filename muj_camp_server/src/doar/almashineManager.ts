import fs from "fs";
import https from "https";
import { Transform } from "stream";

import { CAMPDB } from "../utils/campdb";
import CookieManager from "./cookieManager";
import DoARDataManager from "./dataManager";

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

    private _cookieManager: CookieManager;
    private _dataManager: DoARDataManager;
 
    constructor(campdb: CAMPDB, dataManager: DoARDataManager) {
        this._cookieManager = new CookieManager(campdb);
        this._dataManager = dataManager;
    }

    private _extractCSRFToken(text: string): string {
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

    private async _wasSuccessful(status: any, retry: boolean = true): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const requestWasSuccessful = (status?.success != null && status?.success === 1);
            if (requestWasSuccessful) {
                resolve(true);
            } else {
                if (retry) {
                    await this._updateSessionCookie();
                }
                resolve(false);
            }
        });
    }

    async startSession() {
        await this._cookieManager.startSession();
        if (this._cookieManager.getCookies() === "") {
            await this._updateSessionCookie();
        }
    }

    private async _updateSessionCookie() {
        await fetch("https://mujalumni.in/account?cid=359")
        .then(async (response) => {
            await response.text().then(text => {
                this._cookieManager.updateCookies(response.headers.get("set-cookie")!, this._extractCSRFToken(text));
                if (this._cookieManager.getCSRFToken() === "") {
                    console.error("DoAR Almashines Unable to fetch CSRF Token.");
                }
            });
            await this._updatePHPSessionCookie();
        }).catch(error => {
            console.error("DoAR Almashines Login Session Cookie Error.");
        });
    }

    private async _updatePHPSessionCookie() {
        await fetch("https://mujalumni.in/api/institutes/getSocialSignupUrls/1", {
            "headers": {
                "cookie": this._cookieManager.getCookies(["encToken"])!,
                "csrf": this._cookieManager.getCSRFToken()
            },
            "method": "POST"
        })
        .then(async (response) => {
            this._cookieManager.updateCookies(response.headers.get("set-cookie")!);
            await this._login();
        }).catch(error => {
            console.error("DoAR Almashines Login PHP Session Error.");
        });
    }

    private async _login() {
        await fetch("https://mujalumni.in/api/login/loginUser", {
            "headers": {
                "cookie": this._cookieManager.getCookies(["tz", "encToken",  "PHPSESSID"])!,
                "csrf": this._cookieManager.getCSRFToken()
            },
            "body": `{\"email\":\"${process.env.MAS_MAIl}\",\"password\":\"${process.env.MAS_PASS}\",\"force_signup_cid\":\"359\"}`,
            "method": "POST"
        }).then(response => {
            this._cookieManager.updateCookies(response.headers.get("set-cookie")!);
            response.json().then(status => {
                if (!this._wasSuccessful(status, false)) {
                    console.error("DoAR Almashines Login Failed. Status Response:\n\n" + JSON.stringify(status));
                } else {
                    console.log("DoAR Almashines Login Successful (New Cookies).");
                }
            });
        }).catch(error => {
            console.error("DoAR Almashines Login Error.");
        });
    }

    private async _fetchAlumniData(token: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const alumniDataFile = fs.createWriteStream("./data/alumni_data.csv", {
                flags: "w"
            });
            const request = https.get(`https://mujalumni.in/api/search/download_new/?other_params[fetch_lost]=true&other_params[viewName]=directory&token=${token}`, {
                headers: {
                    cookie: this._cookieManager.getCookies(["tz", "lgdomain", "u_i", "c_i", "l_c", "r_v", "mul", "ast_login_id", "encToken", "PHPSESSID"])!
                }
            }, fileData => {
                fileData
                .pipe(new FileCleaner())
                .pipe(alumniDataFile);
                
                alumniDataFile.on("finish", () => {
                    alumniDataFile.close();
                    resolve(true);
                })

            });
            setTimeout(() => {
                request.abort();
                console.error("DoAR Almashines Alumni Data Fetch Failed [Data Download Timed-Out].");
                resolve(false);
            }, 1200000);
        });
    }

    async getAlumniData(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fetch("https://mujalumni.in/api/search/checkPasswordOnDownload", {
                "headers": {
                    "cookie": this._cookieManager.getCookies(["tz", "lgdomain", "u_i", "c_i", "l_c", "r_v", "mul", "ast_login_id", "encToken", "PHPSESSID"])!,
                    "csrf": this._cookieManager.getCSRFToken()
                },
                "body": `{\"enteredPass\":\"${process.env.MAS_PASS}\"}`,
                "method": "POST"
            }).then(response => {
                response.json().then(async (status: any) => {
                    if (!(await this._wasSuccessful(status))) {
                        console.error("DoAR Almashines Alumni Data Fetch Failed. Status Response:\n\n" + JSON.stringify(status));
                        resolve(false);
                    } else {
                        if (!(await this._fetchAlumniData(status.token))) {
                            resolve(false);
                        }
                        if (!(await this._dataManager.updateDBDataFromCSV())) {
                            console.error("DoAR Almashines Alumni Data Fetch Failed [CSV to DB Data Failed].");
                            resolve(false);
                        } else {
                            resolve(true);
                        }
                    }
                });
            }).catch(error => {
                console.error("DoAR Almashines Error: " + error);
                resolve(false);
            });
        });
    }

    async addAlumniWorkExperience(alumniID: string, alumniWorkExperience: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fetch("https://mujalumni.in/api/work/save_work", {
                "headers": {
                    "cookie": this._cookieManager.getCookies(["tz", "lgdomain", "u_i", "c_i", "l_c", "r_v", "mul", "ast_login_id", "encToken", "PHPSESSID"])!,
                    "csrf": this._cookieManager.getCSRFToken()
                },
                "body": `{\"company_name\":\"${alumniWorkExperience.company}\",\"designation_name\":\"${alumniWorkExperience.designation}\",\"industry_name\":\"Academics\",${(alumniWorkExperience.fromMonth != null && alumniWorkExperience.fromYear != null) ? `\"form_work_from_month\":${parseInt(alumniWorkExperience.fromMonth)},` : `\"form_work_from_month\":0,`}${(alumniWorkExperience.toMonth != null && alumniWorkExperience.toYear != null) ? `\"form_work_to_month\":${(alumniWorkExperience.toMonth === "c") ? 0 : parseInt(alumniWorkExperience.toMonth)},` : `\"form_work_to_month\":0,`}${(alumniWorkExperience.fromMonth != null && alumniWorkExperience.fromYear != null) ? `\"form_work_from\":\"${alumniWorkExperience.fromYear}\",` : ``}${(alumniWorkExperience.toMonth != null && alumniWorkExperience.toYear != null) ? `\"form_work_to\":\"${(alumniWorkExperience.toYear === "c") ? "1901" : alumniWorkExperience.toYear}\",` : ``}\"uid\":\"${alumniID}\"}`,
                "method": "POST"
            }).then(response => {
                response.json().then(async status => {
                    if (!(await this._wasSuccessful(status))) {
                        console.error("DoAR Almashines Alumni Work Update Failed. Status Response:\n\n" + JSON.stringify(status));
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            }).catch(error => {
                console.error("DoAR Almashines Work Update Error: " + error);
                resolve(false);
            });
        });
    }

    async addAlumniEducation(alumniID: string, alumniEducation: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fetch("https://mujalumni.in/api/education/save_education", {
                "headers": {
                    "cookie": this._cookieManager.getCookies(["tz", "lgdomain", "u_i", "c_i", "l_c", "r_v", "mul", "ast_login_id", "encToken", "PHPSESSID"])!,
                    "csrf": this._cookieManager.getCSRFToken()
                },
                "body": `{\"newEdit\":true,\"institute\":\"${alumniEducation.institute}\",\"institute_id\":-1,${(alumniEducation.from != null) ? `\"start\":\"${alumniEducation.from}\",` : ``}${(alumniEducation.from != null && alumniEducation.to != null) ? `\"end\":\"${alumniEducation.to}\",` : ``}${(alumniEducation.degree != null) ? `\"degree\":\"${alumniEducation.degree}\",` : ``}\"submitting\":true,\"iserror\":false,\"error_message\":\"\",${(alumniEducation.from != null) ? `\"yoj\":\"${alumniEducation.from}\",` : ``}${(alumniEducation.from != null && alumniEducation.to != null) ? `\"yop\":\"${alumniEducation.to}\",` : ``}\"insti_name\":\"${alumniEducation.institute}\",\"uid\":\"${alumniID}\"}`,
                "method": "POST"
            }).then(response => {
                response.json().then(async status => {
                    if (!(await this._wasSuccessful(status))) {
                        console.error("DoAR Almashines Alumni Education Update Failed. Status Response:\n\n" + JSON.stringify(status));
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            }).catch(error => {
                console.error("DoAR Almashines Education Update Error: " + error);
                resolve(false);
            });
        });
    }

    async updateAlumniLocation(alumniID: string, location: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fetch("https://mujalumni.in/api/profile/updateUserInfo", {
                "headers": {
                    "cookie": this._cookieManager.getCookies(["tz", "lgdomain", "u_i", "c_i", "l_c", "r_v", "mul", "ast_login_id", "encToken", "PHPSESSID"])!,
                    "csrf": this._cookieManager.getCSRFToken()
                },
                "body": `{\"current_city_name\":\"${location}\",\"uid\":\"${alumniID}\"}`,
                "method": "POST"
            }).then(response => {
                response.json().then(async status => {
                    if (!(await this._wasSuccessful(status))) {
                        console.error("DoAR Almashines Alumni Location Update Failed. Status Response:\n\n" + JSON.stringify(status));
                        resolve(false);
                    } else {
                        fetch("https://mujalumni.in/api/profile/user_data_updated", {
                            "headers": {
                                "cookie": this._cookieManager.getCookies(["tz", "lgdomain", "u_i", "c_i", "l_c", "r_v", "mul", "ast_login_id", "encToken", "PHPSESSID"])!,
                                "csrf": this._cookieManager.getCSRFToken()
                            },
                            "body": `{\"uid\":\"${alumniID}\",\"updated_by_uid\":3442655,\"updated_field\":{\"current_city\":0}}`,
                            "method": "POST"
                        }).then(response => {
                            if (!(response.status === 200)) {
                                console.error("DoAR Almashines Alumni Location Update Confirmation Failed. Status Response:\n\n" + JSON.stringify(response));
                                resolve(false);
                            } else {
                                resolve(true);
                            }
                        }).catch(error => {
                            console.error("DoAR Almashines Location Update Error: " + error);
                            resolve(false);
                        });
                    }
                });
            }).catch(error => {
                console.error("DoAR Almashines Location Update Error: " + error);
                resolve(false);
            });
        });
    }

}

export default AlmaShineManager;