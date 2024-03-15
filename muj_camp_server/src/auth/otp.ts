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
        const sendDataTime: Array<Document> = await (await otpCollection.find({
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

    static async #createSession(authEmail: string, app: Application) {
        const userCollection: CAMPCollection = app.locals.campdb.collection("users");
        
        const result = await userCollection.updateOne(
            {
                email: authEmail
            },
            {
                $push: {
                    sessions: {
                        expiry: currentTime() + parseInt(process.env.SESSION_TIME!)
                    }
                }
            } 
        );
        if (!(result.modifiedCount > 0)) {
            throw new Error("Session Create Error.");
        }
    }

    static async #storeOTP(authEmail: string, sessionID: string, otp: string, app: Application, isResendRequest: boolean) {
        const otpCollection: CAMPCollection = app.locals.campdb.collection("otp")

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

    static async sendOTP(authEmail: string, authName: string, sessionID: string, isResendRequest: boolean, app: Application) {
        const otpToSend: string = String(this.#generateOTP());
        const otpToken: string = JWTManger.generateOTPToken(authEmail, otpToSend, sessionID);
        if (!isResendRequest) {
            await this.#createSession(authEmail, app);
        }
        await this.#storeOTP(authEmail, sessionID, otpToken, app, isResendRequest);
        await app.locals.campMailer.sendOTP(authEmail, authName, otpToSend);
    }

    static #generateOTP(): number {
        return Math.floor(100000 + Math.random() * 900000);
    }

}

export default CAMPOTP;