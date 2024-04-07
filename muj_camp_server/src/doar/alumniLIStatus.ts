import { CAMPCollection, CAMPDB } from "../utils/campdb";

class AlumniLSStatus {

    private _campdb: CAMPDB

    constructor(campdb: CAMPDB) {
        this._campdb = campdb;
    }

    async createAlumniLIStatusIfNotExists(alumni: any): Promise<void> {
        const alumniId = alumni.alumniId;
        const doarDbLICollection: CAMPCollection = this._campdb.collection("doar_li_db");

        if (await doarDbLICollection.countDocuments({
            alumniId: alumniId
        }) === 0) {
            await doarDbLICollection.insertOne({
                alumniId: alumniId,
                lastUpdated: "-",
                latestStatus: "-",
                currentStatus: (alumni.linkedin === "") ? "-" : "nl"
            });
        }
    }

    getAlumniLIStatus(alumni: any): object {
        return {
            lastUpdated: alumni.liStatus?.lastUpdated || "-",
            latestStatus: alumni.liStatus?.latestStatus || "-",
            currentStatus: alumni.liStatus?.currentStatus || ((alumni.linkedin === "") ? "-" : "nl")
        };
    }

}

export default AlumniLSStatus;