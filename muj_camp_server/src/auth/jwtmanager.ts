import jwt from "jsonwebtoken";
import * as Common from "../utils/common";

class JWTManger {

    static generateOTPToken(email: string, otp: string): string {
        let jwtData = {
            email: email,
            otp: otp
        };
        return String(email.toAlphaNumeric() + Common.sha256(jwt.sign(jwtData, process.env.JWT_KEY!, {
            expiresIn: "1d"
        })));
    }

    static generateToken(regNo: string, email: string, roles: Array<String>): string {
        let jwtData = {
            regNo: regNo,
            email: email,
            roles: JSON.stringify(roles)
        };
        return jwt.sign(jwtData, process.env.JWT_KEY!, {
            expiresIn: "30d"
        });
    }

    static validateTokenAndReturnUser(token: string) {
        try {
            return jwt.verify(token, process.env.JWT_KEY!);
        } catch (error) {
            return false;
        }
    }

}

export default JWTManger;