import { CAMPDB, CAMPCollection } from "../utils/campdb";

class User {

    private static isValidEmail(email: string): boolean {
        return (/^\S+@jaipur.manipal.edu/.test(email) || /^\S+@muj.manipal.edu/.test(email));
    }
    
    private static isValidRegistrationNumber(regNo: string): boolean {
        return (/^[a-zA-Z0-9]*$/.test(regNo));
    }
    
    private static isValidUserId(userId: string): boolean {
        return (/^\w+\.\w+$/.test(userId));
    }

    static async getUserDetails(userId: string, campdb: CAMPDB): Promise<any> {

        const userCollection: CAMPCollection = campdb.collection("users");
        
        if (this.isValidEmail(userId)) {
            return await userCollection.findOne({email: userId});
        }
        
        if (this.isValidRegistrationNumber(userId)) {
            return await userCollection.findOne({regNo: userId});
        }
        
        if (this.isValidUserId(userId)) {
            const possibleEmails: String[] = [
                `${userId}@muj.manipal.edu`,
                `${userId}@jaipur.manipal.edu`,
            ];
            return await userCollection.findOne({
                email: {
                    $in: possibleEmails
                }
            });
        }

        return null;       
    }

}

export default User;