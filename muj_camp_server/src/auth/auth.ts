import { Application, Request, Response } from "express";

import User from "./user";
import CAMPOTP from "./otp";
import * as Common from "../utils/common";

class CAMPAuthManager {

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
        let userRequest = req.body;
        let userSessionID = userRequest.sid;
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

}

export default CAMPAuthManager;