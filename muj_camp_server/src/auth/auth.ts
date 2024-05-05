import { Application, Request, Response } from "express";
import { Document } from "mongodb";

import User from "./user";
import CAMPOTP from "./otp";
import * as Common from "../utils/common";
import JWTManger from "./jwtmanager";
import CAMPRequest from "../utils/CAMPRequest";

class CAMPAuthManager {

    private static _validateSID(sessionID: string): boolean {
        return (/^[a-z0-9]+$/i.test(sessionID));
    }

    private static async _sendOTP(authEmail: string, authName: string, sessionID: string, isResendRequest: boolean, app: Application, photo: string | null): Promise<object> {
        try {
            await CAMPOTP.sendOTP(authEmail, authName, sessionID, isResendRequest, app);
        } catch (error) {
            if (!String(error).includes("SIDInjection")) {
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
                sid: sessionID,
                photo: photo
            };
        }
    }

    static async handleSignIn(req: CAMPRequest, res: Response, app: Application) {
        let userRequest: any = req.body;
        let userSessionID: string = userRequest.sid;
        if (userSessionID != null && !this._validateSID(userSessionID)) {
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
                    sid: "",
                    photo: userData.photo
                };
            } else {
                if (isResendRequest) {
                    const timeBeforeOTPCanBeResent = await CAMPOTP.isEligibleToReceiveOTP(userData.email, userSessionID, app);
                    if (timeBeforeOTPCanBeResent === 0) {
                        userResponse = await this._sendOTP(userData.email, userData.name, userSessionID, true, app, userData.photo);
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
                        userResponse = await this._sendOTP(userData.email, userData.name, sessionID, false, app, userData.photo);
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

    static async validateSignIn(req: CAMPRequest, res: Response, app: Application) {
        let userRequest = req.body;
        let otp: string = userRequest.otp;
        let userResponse: object = {};
        let userData = await User.getUserDetails(userRequest.authEmail, app.locals.campdb);
        let userSessionID: string = userRequest.sid;
        if ((userData.bypassAuth !== true) && (userSessionID == null || !this._validateSID(userSessionID))) {
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

    static async setUserDataIfAuthRequest(req: CAMPRequest, app: Application): Promise<void> {
        let authEmail = this._getAuthEmailIfAuthRequest(req);
        if (authEmail === "") {
            return;
        }
        
        let userCollection = app.locals.campdb.collection("users");

        const userData: Document[] = await (await userCollection.find({
            email: authEmail
        })).toArray();
        const user: object = userData[0];
        req.user = new User(user);
    }

    private static _getAuthEmailIfAuthRequest(req: CAMPRequest): string {
        if (req == null || req.headers == null || req.headers.authorization == null) {
            return "";
        }
        let userToken: string = String(req.headers.authorization).replace("Bearer ", "");
        const userData = JWTManger.validateTokenAndReturnUser(userToken);
        if (typeof userData === "object") {
            return userData.email || "";
        } else {
            return "";
        }
    }

    private static async _getRoles(authEmail: string, app: Application): Promise<string[]> {
        let userCollection = app.locals.campdb.collection("users");

        const userRolesData: Document[] = await (await userCollection.find({
            email: authEmail
        })).project({
            roles: 1
        }).toArray();
        const userRoles: string[] = userRolesData[0]["roles" as keyof Document] as unknown as string[];
        userRoles.sort((roleX: string, roleY: string) => {
            return roleX.localeCompare(roleY);
        });
        return userRoles;
    }

    static async validateToken(req: CAMPRequest, res: Response, app: Application) {
        let userRequest = req.body;
        let userToken: string = String(req.headers.authorization).replace("Bearer ", "");
        let fetchRoles = userRequest.fetchRoles;
        const userData = JWTManger.validateTokenAndReturnUser(userToken);
        if (typeof userData === "object") {
            if (userRequest.authEmail === userData.email) {
                const userRoles = await this._getRoles(userRequest.authEmail, app);
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

    static async validateTokenWS(userToken: string, authEmail: string, app: Application): Promise<boolean> {
        const userData = JWTManger.validateTokenAndReturnUser(userToken);
        if (typeof userData === "object") {
            if (authEmail === userData.email) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

}

export default CAMPAuthManager;