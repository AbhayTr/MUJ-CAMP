import { Application, Request, Response } from "express";

import User from "./user";
import CAMPOTP from "./otp";
import * as Common from "../utils/common";
import JWTManger from "./jwtmanager";

class CAMPAuthManager {

    static #validateSID(sessionID: string): boolean {
        return (/^[a-z0-9]+$/i.test(sessionID));
    }

    static async #sendOTP(authEmail: string, authName: string, sessionID: string, isResendRequest: boolean, app: Application): Promise<object> {
        try {
            CAMPOTP.sendOTP(authEmail, authName, sessionID, isResendRequest, app);
        } catch (error) {
            if (String(error) !== "SIDInjection") {
                throw error;
            }
        }
        if (isResendRequest) {
            return {
                status: "s"
            }
        } else {
            return {
                status: "s",
                authEmail: authEmail,
                authName: authName,
                sid: sessionID
            };
        }
    }

    static async handleSignIn(req: Request, res: Response, app: Application) {
        let userRequest: any = req.body;
        let userSessionID: string = userRequest.sid;
        if (userSessionID != null && !this.#validateSID(userSessionID)) {
            res.status(403).send({});
            return;
        }
        let isResendRequest = !(userSessionID == null);
        let userData = await User.getUserDetails(userRequest.authManipalId, app.locals.campdb);
        let userResponse: object = {};
        if (userData !== null) {
            if (userData.bypassAuth === true) {
                userResponse = {
                    status: "s",
                    authEmail: userData.email,
                    authName: userData.name,
                    sid: ""
                };
            } else {
                if (isResendRequest) {
                    const timeBeforeOTPCanBeResent = await CAMPOTP.isEligibleToReceiveOTP(userData.email, userSessionID, app);
                    if (timeBeforeOTPCanBeResent === 0) {
                        userResponse = await this.#sendOTP(userData.email, userData.name, userSessionID, true, app);
                    } else {
                        userResponse = {
                            status: "f",
                            error: `OTP can be resent only after ${timeBeforeOTPCanBeResent} seconds. Please try again after ${timeBeforeOTPCanBeResent} seconds.`
                        };
                    }
                } else {
                    const timeBeforeNextPossibleSessionTime: number = await CAMPOTP.isEligibleToCreateSession(userData.email, app);
                    if (timeBeforeNextPossibleSessionTime === 0) {
                        const sessionID = Common.getSessionID(userData.email);
                        userResponse = await this.#sendOTP(userData.email, userData.name, sessionID, false, app);
                    } else {
                        userResponse = {
                            status: "f",
                            error: `%D% ${timeBeforeNextPossibleSessionTime}`
                        }
                    }
                }
            }
        } else {
            userResponse = {
                status: "f",
                error: "This ID is not a valid Manipal ID (Reg. No. 🔢 or Outlook E-Mail 📧) 😡!"
            }
        }
        res.send(userResponse);
    }

    static async validateSignIn(req: Request, res: Response, app: Application) {
        let userRequest = req.body;
        let otp: string = userRequest.otp;
        let userResponse: object = {};
        let userData = await User.getUserDetails(userRequest.authEmail, app.locals.campdb);
        let userSessionID: string = userRequest.sid;
        if ((userData.bypassAuth !== true) && (userSessionID == null || !this.#validateSID(userSessionID))) {
            res.status(403).send({});
            return;
        }
        if (userData != null) {
            if (userData.bypassAuth === true) {
                userResponse = {
                    status: "s",
                    authRoles: userData.roles,
                    authToken: JWTManger.generateToken(userData.regNo, userData.email)
                };
            } else {
                userResponse = await CAMPOTP.validateOTP(userData, userSessionID, otp, app);
            }
        } else {
            userResponse = {
                status: "f",
                error: ""
            };
        }
        res.send(userResponse);
    }

    static async #getRoles(authEmail: string, app: Application): Promise<string[]> {
        let userCollection = app.locals.campdb.collection("users");

        const userRolesData: Document[] = await (await userCollection.find({
            email: authEmail
        })).project({
            roles: 1
        }).toArray();
        return userRolesData[0]["roles" as keyof Document] as unknown as string[];
    }

    static async validateToken(req: Request, res: Response, app: Application) {
        let userRequest = req.body;
        let userToken: string = String(req.headers.authorization).replace("Bearer ", "");
        let fetchRoles = userRequest.fetchRoles;
        const userData = JWTManger.validateTokenAndReturnUser(userToken);
        if (typeof userData === "object") {
            if (userRequest.authEmail === userData.email) {
                const userRoles = await this.#getRoles(userRequest.authEmail, app);
                if (fetchRoles) {
                    res.send({
                        status: "s",
                        authRoles: userRoles
                    });
                } else {
                    res.send({
                        status: "s"
                    });
                }
            } else {
                res.status(403).send({});
            }
        } else {
            res.status(403).send({});
        }
    }

}

export default CAMPAuthManager;