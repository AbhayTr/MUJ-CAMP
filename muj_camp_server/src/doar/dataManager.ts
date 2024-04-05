import fs from "fs";
import csv from "csv-parser";

import { CAMPCollection, CAMPDB } from "../utils/campdb";
import { SortDirection } from "mongodb";

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
                entryInfo["institution"] = institutionMatch[1].trim();
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
                entryInfo["from"] = durationMatch[0].trim();
                if (durationMatch.length > 1) {
                    entryInfo["to"] = durationMatch[durationMatch.length - 1].trim();
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

    private _getAlumniFormattedData(alumniCSVDataRow: any): object | null {
        if ((alumniCSVDataRow["Year of Joining"] == null || alumniCSVDataRow["Year of Joining"].trim() === "0") || (alumniCSVDataRow["Year of Graduation"] == null || alumniCSVDataRow["Year of Graduation"].trim() === "0")) {
            return null;
        }
        return {
            "name": (alumniCSVDataRow["First_Name"] + " " + alumniCSVDataRow["Last_Name"]).trim(),
            "gender": alumniCSVDataRow["Gender"].trim(),
            "muj_from": alumniCSVDataRow["Year of Joining"].trim(),
            "muj_to": alumniCSVDataRow["Year of Graduation"].trim(),
            "degree": alumniCSVDataRow["Course/ Degree"].trim(),
            "school": alumniCSVDataRow["Division/Department"].trim(),
            "faculty": alumniCSVDataRow["Institute"].trim(),
            "designation": alumniCSVDataRow["Current Designation"].trim(),
            "company": alumniCSVDataRow["Current Company"].trim(),
            "prev_work": this._parseExperienceData(alumniCSVDataRow["Other Work"]),
            "education": this._parseEducationData(alumniCSVDataRow["Other Education"]),
            "phone": alumniCSVDataRow["Phone"].trim(),
            "email": alumniCSVDataRow["secondary_email"].trim(),
            "location": alumniCSVDataRow["Current Location"].trim(),
            "country": alumniCSVDataRow["Current Country"].trim(),
            "alumniId": alumniCSVDataRow["Unique Profile ID"].trim(),
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
                const alumniData: object | null = this._getAlumniFormattedData(row);
                if (alumniData == null) {
                    return;
                }
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

    // async getFilters(): Promise<object> {
    //     return null;
    // }

    private async _getHomeDataSet(pageNo: number): Promise<object> {
        const doarDbCollection: CAMPCollection = this._campdb.collection("doar_db");

        const pageSize = parseInt(process.env.RECORDS_PER_PAGE_DOAR!);
        const skip = (pageNo - 1) * pageSize;
        const limit = pageSize;

        const query = [
            {
                $group: {
                    _id: "$_id",
                    name: {
                        $first: "$name"
                    },
                    company: {
                        $first: "$company"
                    },
                    education: {
                        $first: {
                            $arrayElemAt: [
                                "$education",
                                0
                            ]
                        }
                    },
                    linkedin: {
                        $first: "$linkedin"
                    },
                    muj_from: {
                        $first: "$muj_from"
                    },
                    muj_to: {
                        $first: "$muj_to"
                    },
                    alumniId: {
                        $first: "$alumniId"
                    }
                }
            },
            {
                $sort: {
                    linkedin: -1
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ];

        const result = await (await doarDbCollection.aggregate(query)).toArray();
        const totalCount = await doarDbCollection.countDocuments();
        const totalPages = Math.ceil(totalCount / pageSize);
        const alumniData = result.map(alumni => {
            return [
                {
                    name: alumni.name,
                    muj_from: ((alumni.muj_from === "0") ? "N.A." : alumni.muj_from),
                    muj_to: ((alumni.muj_to === "0") ? "N.A." : alumni.muj_to),
                    alumniId: alumni.alumniId || "0"
                },
                alumni.company || ((alumni.company === "") ? "N.A." : alumni.company),
                alumni.education?.institution || "N.A.",
                {
                    lu: "-",
                    ls: "-",
                    cs: (alumni.linkedin === "") ? "-" : "nl"
                }
            ];
        });
        return {
            records: totalCount,
            pages: totalPages,
            data: alumniData,
            headers: [
                "Name",
                "Current Company",
                "Latest Education (apart from MUJ)",
                "Profile Status"
            ]
        };
    }

    private async _getAlumniData(alumniId: string): Promise<any | null> {
        const doarDbCollection: CAMPCollection = this._campdb.collection("doar_db");

        const alumniData: Document | null = await doarDbCollection.findOne({
            alumniId: alumniId
        });
        return alumniData;
    }

    async getAlumniDataSet(searchText: string, pageNumber: number): Promise<object> {
        if (searchText == null || searchText === "") {
            return this._getHomeDataSet(pageNumber);
        }

        const doarDbCollection: CAMPCollection = this._campdb.collection("doar_db");
        const recordsPerPage = parseInt(process.env.RECORDS_PER_PAGE_DOAR!);

        const query = {
            $or: [
                {
                    name: {
                        $regex: searchText,
                        $options: "i"
                    }
                },
                {
                    muj_from: searchText
                },
                {
                    muj_to: searchText
                },
                {
                    alumniId: searchText
                },
                {
                    company: {
                        $regex: searchText,
                        $options: "i"
                    }
                },
                {
                    "prev_work.company": {
                        $regex: searchText,
                        $options: "i"
                    }
                },
                {
                    "education.institution": {
                        $regex: searchText,
                        $options: "i"
                    }
                }
            ]
        };

        const projection = {
            _id: 0,
            name: 1,
            muj_from: 1,
            muj_to: 1,
            alumniId: 1,
            company: 1,
            "prev_work.company": 1,
            education: 1,
            linkedin: 1
        };

        const totalRecords = await doarDbCollection.countDocuments(query);
        const totalPages = Math.ceil(totalRecords / recordsPerPage);
        
        const skip = recordsPerPage * (pageNumber - 1);
        const limit = recordsPerPage;

        const sort: {[key: string]: SortDirection} = {
            linkedin: -1
        };

        const cursor = (await doarDbCollection.find(query, { projection })).sort(sort).skip(skip).limit(limit);

        const results = await cursor.toArray();
        const formattedResults = await Promise.all(results.map(async alumni => {
            let latestEducationInstitution = "N.A.";
            if (!(alumni.education && alumni.education.length > 0)) {
                const originalAlumniData = await this._getAlumniData(alumni.alumniId).then();
                let sortedEducation;
                if (originalAlumniData.education && originalAlumniData.education.length > 0) {
                    sortedEducation = originalAlumniData.education.sort((a: any, b: any) => b.to.localeCompare(a.to));
                } else {
                    sortedEducation = [{
                        institution: "N.A."
                    }];
                }
                latestEducationInstitution = sortedEducation[0].institution;
            } else {
                const sortedEducation = alumni.education.sort((a: any, b: any) => {
                    if (a.to == null || b.to == null) {
                        return 0;
                    }
                    return b.to.localeCompare(a.to)
                });
                latestEducationInstitution = sortedEducation[0].institution;
            }

            const formattedAlumni = [
                {
                    name: alumni.name || "N.A.",
                    muj_from: ((alumni.muj_from === "0") ? "N.A." : alumni.muj_from),
                    muj_to: ((alumni.muj_to === "0") ? "N.A." : alumni.muj_to),
                    alumniId: alumni.alumniId || "0",
                },
                alumni.company || "N.A.",
                alumni.prev_work.length > 0 ? alumni.prev_work[0].company : "N.A.",
                latestEducationInstitution,
                {
                    lu: "-",
                    ls: "-",
                    cs: (alumni.linkedin === "") ? "-" : "nl"
                }
            ];

            return formattedAlumni;
        }));

        return {
            records: totalRecords,
            pages: totalPages,
            data: formattedResults,
            headers: [
                "Name",
                "Current Company",
                "Previous Company",
                "Education (apart from MUJ)",
                "Profile Status"
            ]
        };
    }

}

export default DoARDataManager;