import fs from "fs";
import csv from "csv-parser";

import { CAMPCollection, CAMPDB } from "../utils/campdb";
import AlumniLSStatus from "./alumniLIStatus";

class DoARDataManager {

    private _campdb!: CAMPDB;
    private _alumniLIStatusManager: AlumniLSStatus;
    private _filterKeyMap: any = {
        Institute: "faculty",
        Country: "country",
        Gender: "gender",
        School: "school",
        // "Syncing Status": "liStatus.currentStatus"
    };

    constructor(campdb: CAMPDB) {
        this._campdb = campdb;
        this._alumniLIStatusManager = new AlumniLSStatus(campdb);
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
        return {
            "name": (alumniCSVDataRow["First_Name"] + " " + alumniCSVDataRow["Last_Name"]).trim(),
            "gender": alumniCSVDataRow["Gender"].trim(),
            "muj_from": (alumniCSVDataRow["Year of Joining"].trim() === "0") ? "N.A." : alumniCSVDataRow["Year of Joining"].trim(),
            "muj_to": (alumniCSVDataRow["Year of Graduation"].trim() === "0") ? "N.A." : alumniCSVDataRow["Year of Graduation"].trim(),
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

    async updateDBDataFromCSV(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const doarDbCollection: CAMPCollection = this._campdb.collection("doar_db");
            await this._clearDB();
            
            const insertPromises: Promise<any>[] = [];

            fs.createReadStream("./data/alumni_data.csv")
            .pipe(csv())
            .on("data", (row: any) => {
                const alumniData: any = this._getAlumniFormattedData(row);
                if (alumniData == null) {
                    return;
                }
                const insertLIPromise = this._alumniLIStatusManager.createAlumniLIStatusIfNotExists(alumniData);
                const insertDataPromise = doarDbCollection.insertOne(alumniData);
                insertPromises.push(insertLIPromise);
                insertPromises.push(insertDataPromise);
            })
            .on("end", async () => {
                await Promise.all(insertPromises);
                resolve(true);
            });
        });
    }

    private _getMatchFilters(appliedFilters: any, query: any = {}): object {
        const filters = Object.keys(appliedFilters);
        for (var i = 0; i < filters.length; i++) {
            const filter = filters[i];
            const filterList = appliedFilters[filter];
            query[this._filterKeyMap[filter]] = {
                $in: filterList
            }
        }
        return query;
    }

    private async _getAlumniData(alumniId: string): Promise<any> {
        const doarDbCollection: CAMPCollection = this._campdb.collection("doar_db");

        const alumniData: Document | null = await doarDbCollection.findOne({
            alumniId: alumniId
        });
        return alumniData;
    }

    private _getCompany(prevWorkData: any[], searchText: string): string {
        for (var i = 0; i < prevWorkData.length; i++) {
            const workData = prevWorkData[i];
            if (workData.company.includes(searchText)) {
                return workData.company;
            }
        }
        return "N.A.";
    }

    async getAlumniDataSet(searchText: string, pageNumber: number, appliedFilters: any): Promise<object> {
        searchText = searchText.replace(/[#-.]|[[-^]|[?|{}]/g, "\\$&");
        const doarDbCollection: CAMPCollection = this._campdb.collection("doar_db");
        const recordsPerPage = parseInt(process.env.RECORDS_PER_PAGE_DOAR!);
        
        const skip = recordsPerPage * (pageNumber - 1);
        const limit = recordsPerPage;

        const pipeline = [
            {
                $lookup: {
                    from: "doar_li_db",
                    localField: "alumniId",
                    foreignField: "alumniId",
                    as: "liStatus"
                }
            },
            {
                $match: this._getMatchFilters(appliedFilters)
            },
            {
                $match: {
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
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    muj_from: 1,
                    muj_to: 1,
                    alumniId: 1,
                    company: 1,
                    "prev_work.company": 1,
                    education: 1,
                    linkedin: 1
                }
            },
            {
                $facet: {
                    metadata: [
                        {
                            $count: "totalRecords"
                        },
                        {
                            $addFields: {
                                totalPages: {
                                    $ceil: {
                                        $divide: [
                                            "$totalRecords",
                                            recordsPerPage
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    data: [
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
                    ]
                }
            },
            {
                $unwind: "$metadata" 
            },
            {
                $project: {
                    totalRecords: "$metadata.totalRecords",
                    totalPages: "$metadata.totalPages",
                    data: "$data"
                }
            }
        ];

        const cursor = await doarDbCollection.aggregate(pipeline);
        const [resultMain] = await cursor.toArray();
        
        const totalRecords = resultMain?.totalRecords || 0;
        const totalPages = resultMain?.totalPages || 0;

        const results: Array<any> = resultMain?.data || [];
        const formattedResults = await Promise.all(results.map(async alumni => {
            let latestEducationInstitution = "N.A.";
            if (!(alumni.education && alumni.education.length > 0)) {
                const originalAlumniData = await this._getAlumniData(alumni.alumniId);
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
                    alumniId: alumni.alumniId,
                },
                alumni.company || "N.A.",
                alumni.prev_work.length > 0 ? this._getCompany(alumni.prev_work, searchText) : "N.A.",
                latestEducationInstitution,
                await this._alumniLIStatusManager.getAlumniLIStatus(alumni)
            ];

            if (searchText === "") {
                formattedAlumni.splice(2, 1);
            }

            return formattedAlumni;
        }));

        const headersData = [
            "Name",
            "Current Company",
            "Previous Company",
            "Education (apart from MUJ)",
            "Profile Status"
        ];

        if (searchText === "") {
            headersData.splice(2, 1);
        }

        return {
            records: totalRecords,
            pages: totalPages,
            data: formattedResults,
            headers: headersData
        };
    }

    private async _getFilterOptions(filterID: string, appliedFilters: any, searchText: string): Promise<Array<Array<any>>> {
        const doarDbCollection: CAMPCollection = this._campdb.collection("doar_db");
        
        const matchQuery: any = {
            $match: {}
        };
        matchQuery["$match"][this._filterKeyMap[filterID]] = {
            $exists: true,
            $ne: ""
        };

        matchQuery["$match"] = this._getMatchFilters(appliedFilters, matchQuery["$match"]);

        const pipeline = [
            {
                $match: {
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
                }
            },
            matchQuery,
            {
                $group: {
                    _id: `$${this._filterKeyMap[filterID]}`,
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ];
        
        const result = await (await doarDbCollection.aggregate(pipeline)).toArray();

        if (result.length > 0) {
            const options: Array<Array<any>> = [];
            result.forEach(item => {
                options.push([item._id, item.count]);
            });
            return options;
        } else {
            return [];
        }
    }

    private async _getFilters(filterNames: Array<string>, appliedFilters: any, searchText: string): Promise<object> {
        const filters: any = {};
        for (var i = 0; i < filterNames.length; i++) {
            const filterName: string = filterNames[i];
            filters[filterName] = await this._getFilterOptions(filterName, appliedFilters, searchText);
        }
        return filters;
    }

    async getHomeFilters(appliedFilters: any, searchText: string): Promise<object> {
        const standardFilters: any = this._getFilters(Object.keys(this._filterKeyMap), appliedFilters, searchText);
        // standardFilters["Syncing Status"] = [
            
        // ]
        return standardFilters;
    }

}

export default DoARDataManager;