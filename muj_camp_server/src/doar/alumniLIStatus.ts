import { CAMPCollection, CAMPDB } from "../utils/campdb";

class AlumniLSStatus {

    private _campdb: CAMPDB

    constructor(campdb: CAMPDB) {
        this._campdb = campdb;
    }

    async getAlumniLIStatus(alumni: any): Promise<any> {
        const alumniId = alumni.alumniId;
        const doarDbLICollection: CAMPCollection = this._campdb.collection("doar_li_db");

        const alumniData: Document | null = await doarDbLICollection.findOne({
            alumniId: alumniId
        });

        if (alumniData != null) {
            return alumniData;
        } else {
            return {
                lu: "-",
                ls: "-",
                cs: (alumni.linkedin === "") ? "-" : "nl"
            };
        }
    }

}

export default AlumniLSStatus;