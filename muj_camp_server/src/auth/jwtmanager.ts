import jwt from "jsonwebtoken";
import * as Common from "../utils/common";

class JWTManger {

    static generateOTPToken(email: string, otp: string, sessionID: string, neverExpire: boolean = false): string {
        let jwtData = {
            email: email,
            otp: otp,
            sid: sessionID
        };
        const options: any = {};
        if (!neverExpire) {
            options.expiresIn = "30d";
        } else {
            options.noTimestamp = true;
        }
        return String(email.toAlphaNumeric() + Common.sha256(jwt.sign(jwtData, process.env.JWT_KEY!, options)));
    }

    static generateToken(regNo: string, email: string): string {
        let jwtData = {
            regNo: regNo,
            email: email
        };
        return jwt.sign(jwtData, process.env.JWT_KEY!, {
            expiresIn: "30d"
        });
    }

    static validateTokenAndReturnUser(token: string): any {
        try {
            return JSON.parse(JSON.stringify(jwt.verify(token, process.env.JWT_KEY!)));
        } catch (error) {
            return false;
        }
    }

}

export default JWTManger;