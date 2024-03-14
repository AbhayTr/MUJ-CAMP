import { Application } from "express";

import { CAMPCollection, CAMPDB } from "../utils/campdb";
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
        if (userSessionsCount != null && userSessionsCount > 7) {

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
            return sessionWithMinExpiryTime;
        } else {
            return 0;
        }
    }

    static async isEligibleToReceiveOTP(authEmail: string, sessionID: string, app: Application, resent: boolean = false): Promise<number> {
        const otpCollection: CAMPCollection = app.locals.campdb.collection("otp");

        // Check for previous sent/resent otp time.
        const dataToBeFetched: any = {};
        let key = "sentTime";
        if (resent) {
            key = "resentTime";
        }
        dataToBeFetched[key] = 1;
        const sendDataTime: Array<Document> = await (await otpCollection.find({
            email: authEmail,
            sid: sessionID
        })).project(dataToBeFetched).toArray();
        if (sendDataTime == null || sendDataTime.length === 0) {
            return 0;
        } else {
            const timeToPrevOTP = (parseInt(sendDataTime[0][key]) - currentTime());
            if (timeToPrevOTP < 10) {
                return timeToPrevOTP;
            } else {
                return 0;
            }
        }
    }

    #generateOTP(): number {
        return Math.floor(100000 + Math.random() * 900000);
    }

}

export default CAMPOTP;