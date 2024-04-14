import { CAMPCollection } from "../utils/campdb";

class AlumniLSStatus {

    static getAlumniLIStatus(alumni: any): object {
        return {
            lastUpdated: alumni.liStatus.lastUpdated || "-",
            latestStatus: alumni.liStatus.latestStatus || "-",
            currentStatus: alumni.liStatus.currentStatus || ((alumni.linkedin === "") ? "-" : "nl")
        };
    }

    static async updateAlumniLIStatus(alumniId: string, alumniData: any, doarDbCollection: CAMPCollection) {
        doarDbCollection.updateOne({
            alumniId: alumniId
        }, {
            $set: alumniData
        });
    }

}

export default AlumniLSStatus;