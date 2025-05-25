import { CAMPCollection } from "../utils/campdb";

class AlumniLSStatus {

    static getAlumniLIStatus(alumni: any): object {
        return {
            alumniId: alumni.alumniId,
            lastUpdated: alumni.liStatus.lastUpdated || "-",
            latestStatus: alumni.liStatus.latestStatus || "-",
            currentStatus: alumni.liStatus.currentStatus || ((alumni.linkedin === "") ? "-" : "nl")
        };
    }

    static async updateAlumniLIStatus(alumniId: string, alumniData: any, doarDbCollection: CAMPCollection) {
        const toCheck: any = {
            linkedin: {
                $ne: ""
            }
        };
        if (alumniId !== "") {
            toCheck["alumniId"] = alumniId;
        }
        await doarDbCollection.updateMany(toCheck, {
            $set: alumniData
        });
    }

}

export default AlumniLSStatus;