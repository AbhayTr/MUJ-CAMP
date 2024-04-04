import fs from "fs";
import csv from "csv-parser";

import { CAMPCollection, CAMPDB } from "../utils/campdb";

class DoARDataManager {

    private _campdb!: CAMPDB;

    constructor(campdb: CAMPDB) {
        this._campdb = campdb;
    }

    private _parseExperienceDataWithTimeline(dataString: string): object[] {
        const regex: any = /([^,-]+)-([^,]+)-till\s(\d{4}),?/g;
        let match: any;
        let parsedData: object[] = [];
        while ((match = regex.exec(dataString)) !== null) {
            let [_, designation, companyName, untilWhen] = match;
            parsedData.push({
                designation: designation.trim(),
                company: companyName.trim(),
                untilWhen: untilWhen.trim()
            });
        }
        return parsedData;
    }
    
    private _parseExperienceDataWithoutTimeline(dataString: string): object[] {
        const regex: any = /([^,-]+)-([^,]+)-duration not mentioned/g;
        let match: any;
        let parsedData: object[] = [];
        while ((match = regex.exec(dataString)) !== null) {
            let [_, designation, companyName] = match;
            parsedData.push({
                designation: designation.trim(),
                company: companyName.trim(),
                untilWhen: "N.A."
            });
        }
        return parsedData;
    }
    
    private _parseExperienceData(dataString: string) {
        return this._parseExperienceDataWithTimeline(dataString).concat(this._parseExperienceDataWithoutTimeline(dataString));
    }

    private _parseEducationData(inputString: string): object[] {
        const entries: string[] = inputString.split(",");
        entries.splice(entries.length - 1, 1);
        
        const result: object[] = [];
    
        entries.forEach(entry => {
            const entryInfo: any = {};
            var trimmedEntry: string = entry.trim();
            var noDegree: boolean = false;
            
            const institutionMatch: RegExpMatchArray | null = trimmedEntry.match(/^(.*?) \[/);
            if (institutionMatch) {
                entryInfo["institution"] = institutionMatch[1];
            }
    
            const degreeMatch = trimmedEntry.match(/\[(.*?)\]/);
            if (degreeMatch) {
                const degreeInfo = degreeMatch[1];
                entryInfo["degree"] = degreeInfo.trim();
            } else {
                noDegree = true;
            }
    
            const durationMatch = trimmedEntry.match(/\d{4}/g);
            if (durationMatch) {
                entryInfo["from"] = durationMatch[0];
                if (durationMatch.length > 1) {
                    entryInfo["to"] = durationMatch[durationMatch.length - 1];
                }
            }
    
            if (noDegree) {
                if (entryInfo["from"]) {
                    trimmedEntry = trimmedEntry.replace(entryInfo["from"], "");
                }
                if (entryInfo["to"]) {
                    trimmedEntry = trimmedEntry.replace(entryInfo["to"], "");
                }
                entryInfo["institution"] = trimmedEntry.trim();
            }
    
            result.push(entryInfo);
        });
    
        return result;
    }

    private _returnProperLinkedInURLOrEmpty(publicProfilesString: string): string {
        if (publicProfilesString != null && publicProfilesString != "" && publicProfilesString.startsWith("LinkedIn Profile Url:")) {
            return publicProfilesString.replace("LinkedIn Profile Url:", "").trim();
        } else {
            return "";
        }
    }

    private _getAlumniFormattedData(alumniCSVDataRow: any): object {
        return {
            "name": alumniCSVDataRow["First_Name"] + " " + alumniCSVDataRow["Last_Name"],
            "gender": alumniCSVDataRow["Gender"],
            "muj_from": alumniCSVDataRow["Year of Joining"],
            "muj_to": alumniCSVDataRow["Year of Graduation"],
            "degree": alumniCSVDataRow["Course/ Degree"],
            "school": alumniCSVDataRow["Division/Department"],
            "faculty": alumniCSVDataRow["Institute"],
            "designation": alumniCSVDataRow["Current Designation"],
            "company": alumniCSVDataRow["Current Company"],
            "prev_work": this._parseExperienceData(alumniCSVDataRow["Other Work"]),
            "education": this._parseEducationData(alumniCSVDataRow["Other Education"]),
            "phone": alumniCSVDataRow["Phone"],
            "email": alumniCSVDataRow["secondary_email"],
            "location": alumniCSVDataRow["Current Location"],
            "country": alumniCSVDataRow["Current Country"],
            "alumniId": alumniCSVDataRow["Unique Profile ID"],
            "linkedin": this._returnProperLinkedInURLOrEmpty(alumniCSVDataRow["Public Profile Urls"])
        };
    }

    private async _clearDB() {
        await this._campdb.collection("doar_db").drop();
    }

    private async _insertAlumniRecord(alumniData: object): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const doarDbCollection: CAMPCollection = this._campdb.collection("doar_db");
            await doarDbCollection.insertOne(alumniData);
            resolve(true);
        });
    }

    async updateDBDataFromCSV(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await this._clearDB();
            fs.createReadStream("./data/alumni_data.csv").pipe(csv())
            .on("data", async (row: any) => {
                const alumniData: object = this._getAlumniFormattedData(row);
                if (!(await this._insertAlumniRecord(alumniData))) {
                    console.error("DoAR DB Data Insertion Error.");
                    resolve(false);
                }
            })
            .on("end", () => {
                resolve(true);
            });
        });
    }

}

export default DoARDataManager;