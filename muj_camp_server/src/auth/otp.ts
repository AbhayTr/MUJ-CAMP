import { Application } from "express";

import { CAMPCollection } from "../utils/campdb";
import JWTManger from "./jwtmanager";
import { AggregationCursor, Document, PullOperator } from "mongodb";
import { currentTime } from "../utils/common";

class CAMPOTP {


    static async isEligibleToCreateSession(authEmail: string, app: Application): Promise<number> {
        const userCollection: CAMPCollection = app.locals.campdb.collection("users");

        // Remove expired sessions.
        await userCollection.updateMany(
            {
                email: authEmail
            },
            {
                $pull: {
                    sessions: {
                        expiry: {
                            $lt: currentTime()
                        }
                    }
                } as unknown as PullOperator<Document>
            }
        );

        // Check for sessions limit.
        const userSessions: AggregationCursor = await userCollection.aggregate([
            {
                $match: {
                    email: authEmail
                }
            },
            {
                $match: {
                    sessions: {
                        $exists: true,
                        $not: {
                            $size: 0
                        }
                    }
                }
            },
            {
                $unwind: "$sessions"
            },
            {
                $match: { 
                    "sessions.expiry": {
                        $gt: currentTime()
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    sessionCount: {
                        $sum: 1
                    }
                }
            }
        ]);
        if (userSessions == null) {
            return 0;
        }
        const userSessionsCount: number = (await userSessions.next())?.sessionCount;
        if (userSessionsCount != null && userSessionsCount >= parseInt(process.env.SESSIONS_LIMIT!)) {

            // Get the latest token to expire, to inform the user.
            const sessionWithMinExpiry: AggregationCursor = await userCollection.aggregate([
                {
                    $match: {
                        email: authEmail
                    }
                },
                {
                    $unwind: "$sessions"
                },
                {
                    $sort: {
                        "sessions.expiry": 1
                    }
                },
                {
                    $limit: 1
                },
                {
                    $project: {
                        expiry: "$sessions.expiry"
                    }
                }
            ]);
            const sessionWithMinExpiryTime: number = (await sessionWithMinExpiry.next())?.expiry;
            if (sessionWithMinExpiry == null) {
                throw new Error("Session Min Expiry Problem.");
            }
            return (sessionWithMinExpiryTime - currentTime());
        } else {
            return 0;
        }
    }

    static async isEligibleToReceiveOTP(authEmail: string, sessionID: string, app: Application): Promise<number> {
        const otpCollection: CAMPCollection = app.locals.campdb.collection("otp");

        // Check for previous sent/resent otp time.
        const dataToBeFetched: any = {};
        let key = "resentTime";
        dataToBeFetched[key] = 1;
        const sendDataTime: Document[] = await (await otpCollection.find({
            email: authEmail,
            sid: sessionID
        })).project(dataToBeFetched).toArray();
        if (sendDataTime == null || sendDataTime.length === 0) {
            return 0;
        } else {
            const timeToPrevOTP = (currentTime() - parseInt(sendDataTime[0][key]));
            if (timeToPrevOTP < parseInt(process.env.OTP_TIME_GAP!)) {
                return parseInt(process.env.OTP_TIME_GAP!) - timeToPrevOTP;
            } else {
                return 0;
            }
        }
    }

    private static async _createSession(authEmail: string, sessionID: string, app: Application) {
        const userCollection: CAMPCollection = app.locals.campdb.collection("users");
        
        const result = await userCollection.updateOne(
            {
                email: authEmail
            },
            {
                $push: {
                    sessions: {
                        expiry: currentTime() + parseInt(process.env.SESSION_TIME!),
                        sid: sessionID
                    }
                }
            } 
        );
        if (!(result.modifiedCount > 0)) {
            throw new Error("Session Create Error.");
        }
    }

    private static async _storeOTP(authEmail: string, sessionID: string, otp: string, app: Application, isResendRequest: boolean) {
        const otpCollection: CAMPCollection = app.locals.campdb.collection("otp");

        if (isResendRequest) {
            const result = await otpCollection.deleteMany({
                sid: sessionID
            });
            if (!(result.deletedCount > 0)) {
                throw new Error("SIDInjection");
            }
        }
        const toInsert: any = {
            sid: sessionID,
            email: authEmail,
            otp: otp
        };
        if (isResendRequest) {
            toInsert.resentTime = currentTime()
        }
        await otpCollection.insertOne(toInsert);
    }

    static async sendOTP(authEmail: string, authName: string, sessionID: string, isResendRequest: boolean, app: Application, emailToSend: string) {
        const otpToSend: string = String(this._generateOTP());
        const otpToken: string = JWTManger.generateOTPToken(authEmail, otpToSend, sessionID, true);
        if (!isResendRequest) {
            await this._createSession(authEmail, sessionID, app);
        }
        await this._storeOTP(authEmail, sessionID, otpToken, app, isResendRequest);
        app.locals.campMailer.sendOTP(emailToSend, authName, otpToSend);
    }

    private static _generateOTP(): number {
        return Math.floor(100000 + Math.random() * 900000);
    }

    private static _isValidOTP(otp: string): boolean {
        return (otp.length === 6 && !Number.isNaN(otp));
    }

    private static async _isEligibleToValidateOTP(authEmail: string, sessionID: string, app: Application): Promise<number> {
        const otpCollection: CAMPCollection = app.locals.campdb.collection("otp");

        // Check for previous otp validation attempt time.
        const dataToBeFetched: any = {};
        let key = "attemptTime";
        dataToBeFetched[key] = 1;
        const attemptTime: Array<Document> = await (await otpCollection.find({
            email: authEmail,
            sid: sessionID
        })).project(dataToBeFetched).toArray();
        if (attemptTime == null || attemptTime.length === 0) {
            return 0;
        } else {
            const timeToPrevAttempt = (currentTime() - parseInt(attemptTime[0][key]));
            if (timeToPrevAttempt < parseInt(process.env.OTP_ATTEMPT_GAP!)) {
                return parseInt(process.env.OTP_ATTEMPT_GAP!) - timeToPrevAttempt;
            } else {
                return 0;
            }
        }
    }

    private static async _isCorrectOTP(authEmail: string, sessionID: string, otp: string, app: Application): Promise<boolean> {
        const otpCollection: CAMPCollection = app.locals.campdb.collection("otp");
        const userCollection: CAMPCollection = app.locals.campdb.collection("users");
        
        const otpToken: string = JWTManger.generateOTPToken(authEmail, otp, sessionID, true);
        const checkAndDeleteOTP = await otpCollection.deleteMany({
            sid: sessionID,
            email: authEmail,
            otp: otpToken
        });
        if (!(checkAndDeleteOTP.deletedCount > 0)) {
            await otpCollection.updateOne({
                sid: sessionID,
                email: authEmail
            }, {
                $set: {
                    attemptTime: currentTime()
                }
            });
            return false;
        } else {
            await userCollection.updateMany(
                {
                    email: authEmail
                },
                {
                    $pull: {
                        sessions: {
                            sid: sessionID
                        }
                    } as unknown as PullOperator<Document>
                }
            );
            return true;
        }
    }

    static async validateOTP(userData: any, sessionID: string, otp: string, app: Application): Promise<object> {
        let userResponse = {};
        if (!this._isValidOTP(otp)) {
            userResponse = {
                status: "f",
                error: ""
            };
        } else {
            const timeBeforeOTPCanBeValidated: number = await this._isEligibleToValidateOTP(userData.email, sessionID, app);
            if (timeBeforeOTPCanBeValidated === 0) {
                if (await this._isCorrectOTP(userData.email, sessionID, otp, app)) {
                    userResponse = {
                        status: "s",
                        authRoles: userData.roles,
                        authToken: JWTManger.generateToken(userData.regNo, userData.email)
                    };
                } else {
                    userResponse = {
                        status: "f",
                        error: "Wrong OTP ❌. Please ensure that you are entering the Correct OTP 🔒 and try again."
                    }
                }
            } else {
                userResponse = {
                    status: "f",
                    error: `Please wait for ${timeBeforeOTPCanBeValidated} seconds, before trying to continue again.`
                }
            }
        }
        return userResponse;
    }

}

export default CAMPOTP;