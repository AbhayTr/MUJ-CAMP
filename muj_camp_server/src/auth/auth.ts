import { Application, Request, Response } from "express";

import User from "./user";
import CAMPOTP from "./otp";
import * as Common from "../utils/common";

class CAMPAuthManager {

    static async handleSignIn(req: Request, res: Response, app: Application) {
        let userRequest = req.body;
        let userSessionID = userRequest.sid;
        let isResendRequest = (userSessionID == null);
        let userData = await User.getUserDetails(userRequest.authManipalId, app.locals.campdb);
        let userResponse = {};
        if (userData !== null) {
            const nextPossibleSessionTime: number = await CAMPOTP.isEligibleToCreateSession(userData.email, app);
            if (nextPossibleSessionTime === 0) {
                const sessionID = Common.getSessionID(userData.email);
                const timeBeforeOTPCanBeSent = await CAMPOTP.isEligibleToReceiveOTP(userData.email, sessionID, app, isResendRequest);
                if (timeBeforeOTPCanBeSent === 0) {
                    // Send OTP.
                    userResponse = {
                        status: "s",
                        authEmail: userData.email,
                        authName: userData.name
                    }
                } else {
                    if (isResendRequest) {
                        userResponse = {
                            status: "f",
                            error: `OTP can be resent only after ${timeBeforeOTPCanBeSent} seconds. Please try again after ${timeBeforeOTPCanBeSent} seconds.`
                        };
                    } else {
                        userResponse = {
                            status: "f",
                            error: `%D% ${timeBeforeOTPCanBeSent}`
                        };
                    }
                }
            } else {
                userResponse = {
                    status: "f",
                    error: `This is odd. Somehow you have tried too many times to continue. Now you have to wait till ${Common.timestampToHumanTime(nextPossibleSessionTime)} before trying to continue again. To continue again, reload the page and try again.`
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