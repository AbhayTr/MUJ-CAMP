import fs from "fs";
import csv from "csv-parser";
import { Document } from "mongodb";

import { CAMPCollection, CAMPDB } from "../utils/campdb";
import AlumniLSStatus from "./alumniLIStatus";
import { currentTime, specialHash } from "../utils/common";
import { FORTUNE500_LIST, QS100_LIST } from "./doarData";

class DoARDataManager {

    private _doarDbCollection: CAMPCollection;
    private _doarCollection: CAMPCollection;
    
    private _filterKeyMap: any = {
        Institute: "faculty",
        Country: "country",
        Gender: "gender",
        School: "school",
        "Syncing Status": "liStatus.currentStatus",
        "Latest Status": "liStatus.latestStatus",
        Membership: "membership",
        "Fortune 500 Companies": "fortune500",
        "QS Top 100 Universities": "qs100"
    };

    constructor(campdb: CAMPDB) {
        this._doarDbCollection = campdb.collection("doar_db");
        this._doarCollection = campdb.collection("doar");
    }

    private _getSearchFields(searchText: string): Array<any> {
        return [
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
                designation: {
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
                "prev_work.designation": {
                    $regex: searchText,
                    $options: "i"
                }
            },
            {
                "education.institution": {
                    $regex: searchText,
                    $options: "i"
                }
            },
            {
                "education.degree": {
                    $regex: searchText,
                    $options: "i"
                }
            },
            {
                regNumber: {
                    $regex: searchText,
                    $options: "i"
                }
            },
            {
                location: {
                    $regex: searchText,
                    $options: "i"
                }
            },
            {
                country: {
                    $regex: searchText,
                    $options: "i"
                }
            }
        ];
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
    
    private _parseExperienceData(dataString: string, currentCompany: string, currentDesignation: string) {
        const otherCompanies = []
        if (currentCompany.indexOf("\n") !== -1 && currentDesignation.indexOf("\n") !== -1) {
            const companiesData = currentCompany.split("\n");
            const designationData = currentDesignation.split("\n");
            for (var i = 1; i < companiesData.length; i++) {
                const companyName = companiesData[i];
                const designation = designationData[i];
                otherCompanies.push({
                    designation: designation.trim(),
                    company: companyName.trim(),
                    untilWhen: "N.A."
                });
            }
        }
        return this._parseExperienceDataWithTimeline(dataString).concat(this._parseExperienceDataWithoutTimeline(dataString)).concat(otherCompanies);
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

    private _extractLinkedInUserIdUrl(linkedInUrl: string): string {
        try {
            const url = new URL(linkedInUrl);
            return `${url.origin}${url.pathname}`;
        } catch (err) {
            console.error("Invalid URL:", err);
            return "";
        }
    }

    private _returnProperLinkedInURLOrEmpty(publicProfilesString: string): string {
        if (publicProfilesString != null && publicProfilesString != "" && publicProfilesString.startsWith("LinkedIn Profile Url:") && !publicProfilesString.includes("/mwlite/") && !publicProfilesString.includes("/public-profile/")) {
            var liUrl = publicProfilesString.replace("LinkedIn Profile Url:", "").trim();
            if (!(liUrl.startsWith("https://") || liUrl.startsWith("http://"))) {
                return this._extractLinkedInUserIdUrl(`https://${liUrl}`);
            } else {
                return this._extractLinkedInUserIdUrl(liUrl);
            }
        } else {
            return "";
        }
    }

    private _getMembershipType(membership: string): string {
        if (membership === "Annual Membership") {
            return "Yearly";
        } else if (membership === "Life Time Membership") {
            return "Lifetime";
        } else {
            return "N.A.";
        }
    }

    private _valueInArray(array: Array<string>, value: string, extensiveSearch: boolean = false): boolean {
        if (value == null || array == null || value.replaceAll(" ", "") === "") {
            return false;
        }
        if (extensiveSearch) {
            const valueParts = value.toLowerCase().split(" ");
            for (var j = 0; j < valueParts.length; j++) {
                const currentPart = valueParts[j].replaceAll(" ", "");
                for (var i = 0; i < array.length; i++) {
                    const valAtI = array[i].toLowerCase().replaceAll(" ", "");
                    if (valAtI === currentPart) {
                        return true;
                    }
                }
            }
        } else {
            for (var i = 0; i < array.length; i++) {
                const valAtI = array[i].toLowerCase().replaceAll(" ", "");
                if (valAtI === value.toLowerCase().replaceAll(" ", "")) {
                    return true;
                }
            }
        }
        return false;
    }

    private _isFortune500(currentCompany: string, prevWork: any): boolean {
        if (this._valueInArray(FORTUNE500_LIST, currentCompany, true)) {
            return true;
        } else {
            for (var i = 0; i < prevWork.length; i++) {
                if (this._valueInArray(FORTUNE500_LIST, prevWork[i].company)) {
                    return true;
                }
            }
            return false;
        }
    }

    private _isQS100(education: any): boolean {
        for (var i = 0; i < education.length; i++) {
            if (this._valueInArray(QS100_LIST, education[i].institution)) {
                return true;
            }
        }
        return false;
    }

    private _getAlumniFormattedData(alumniCSVDataRow: any): object | null {
        
        const currentCompany = alumniCSVDataRow["Current Company"].split("\n")[0].trim();
        const prevWork = this._parseExperienceData(alumniCSVDataRow["Other Work"], alumniCSVDataRow["Current Company"].trim(), alumniCSVDataRow["Current Designation"].trim());
        const education = this._parseEducationData(alumniCSVDataRow["Other Education"]);

        return {
            "name": (alumniCSVDataRow["First_Name"] + " " + alumniCSVDataRow["Last_Name"]).trim(),
            "gender": alumniCSVDataRow["Gender"].trim(),
            "muj_from": (alumniCSVDataRow["Year of Joining"].trim() === "0" || alumniCSVDataRow["Year of Joining"].trim() === "") ? "N.A." : alumniCSVDataRow["Year of Joining"].trim(),
            "muj_to": (alumniCSVDataRow["Year of Graduation"].trim() === "0" || alumniCSVDataRow["Year of Graduation"].trim() === "") ? "N.A." : alumniCSVDataRow["Year of Graduation"].trim(),
            "degree": alumniCSVDataRow["Course/ Degree"].trim(),
            "school": alumniCSVDataRow["Division/Department"].trim(),
            "faculty": alumniCSVDataRow["Institute"].trim(),
            "designation": alumniCSVDataRow["Current Designation"].split("\n")[0].trim(),
            "company": currentCompany,
            "prev_work": prevWork,
            "education": education,
            "phone": alumniCSVDataRow["Phone"].trim(),
            "email": alumniCSVDataRow["secondary_email"].trim(),
            "location": (alumniCSVDataRow["Current Location"]) ? alumniCSVDataRow["Current Location"].trim() : "N.A.",
            "country": alumniCSVDataRow["Current Country"].trim(),
            "alumniId": alumniCSVDataRow["Unique Profile ID"].trim(),
            "linkedin": this._returnProperLinkedInURLOrEmpty(alumniCSVDataRow["Public Profile Urls"]),
            "membership": this._getMembershipType(alumniCSVDataRow["Membership"]),
            "regNumber": (alumniCSVDataRow["Registration number / Roll Number"] === "") ? "N.A." : alumniCSVDataRow["Registration number / Roll Number"],
            "fortune500": this._isFortune500(currentCompany, prevWork) ? "Yes" : "No",
            "qs100": this._isQS100(education) ? "Yes" : "No"
        };
    }

    private async _updateAlumniData(alumniData: any) {

        const alumniId = alumniData.alumniId;

        if (await this._doarDbCollection.countDocuments({
            alumniId: alumniId
        }) === 0) {
            alumniData["liStatus"] = {
                lastUpdated: "-",
                latestStatus: "-",
                currentStatus: (alumniData.linkedin === "") ? "-" : "nl"
            };
            await this._doarDbCollection.insertOne(alumniData);
        } else {
            if (alumniData.linkedin !== "") {
                await this.updateAlumniLIData(alumniId, {
                    currentStatus: "nl"
                });
            }
            await this._doarDbCollection.updateOne(
                {
                    alumniId: alumniId
                },
                {
                    $set: alumniData
                }
            );
        }
    }

    async updateDBDataFromCSV(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const updateAlumniPromises: Array<Promise<void>> = [];
            fs.createReadStream("./data/alumni_data.csv")
            .pipe(csv())
            .on("data", async (row: any) => {
                const alumniData: any = this._getAlumniFormattedData(row);
                if (alumniData == null) {
                    return;
                }
                updateAlumniPromises.push(this._updateAlumniData(alumniData));
            })
            .on("end", async () => {
                await Promise.all(updateAlumniPromises);
                await this._doarCollection.updateOne({
                    "desc": "Alumni Data Details"
                }, {
                    $set: {
                        "desc": "Alumni Data Details",
                        "dataUpdatedAt": currentTime()
                    }
                }, {
                    upsert: true
                });
                resolve(true);
            });
        });
    }

    private _getMatchFilters(filtersApplied: any, query: any = {}): object {
        const filters = Object.keys(filtersApplied);
        for (var i = 0; i < filters.length; i++) {
            const filter = filters[i];
            let filterList = filtersApplied[filter];
            if (filter === "Syncing Status") {
                filterList = filterList.map((syncingStatusFilter: any) => {
                    if (syncingStatusFilter == "Not Syncing") {
                        return "nl";
                    } else if (syncingStatusFilter == "Currently Syncing") {
                        return "l";
                    } else {
                        return "-";
                    }
                });
            } else if (filter === "Latest Status") {
                filterList = filterList.map((latesetStatusFilter: any) => {
                    if (latesetStatusFilter == "Sync Failed") {
                        return "f";
                    } else if (latesetStatusFilter == "Successfully Synced") {
                        return "s";
                    } else {
                        return "-";
                    }
                });
            }
            query[this._filterKeyMap[filter]] = {
                $in: filterList
            }
        }
        return query;
    }

    private async _getAlumniData(alumniId: string): Promise<any> {
        const alumniData: Document | null = await this._doarDbCollection.findOne({
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

    async getAlumniDataSet(searchText: string, pageNumber: number, filtersApplied: any): Promise<object> {
        const recordsPerPage = parseInt(process.env.RECORDS_PER_PAGE_DOAR!);
        
        const skip = recordsPerPage * (pageNumber - 1);
        const limit = recordsPerPage;

        const pipeline = [
            {
                $match: this._getMatchFilters(filtersApplied)
            },
            {
                $match: {
                    $or: this._getSearchFields(searchText)
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
                    linkedin: 1,
                    liStatus: 1,
                    location: 1,
                    school: 1,
                    membership: 1,
                    fortune500: 1,
                    qs100: 1,
                    regNumber: 1,
                    country: 1
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

        const cursor = await this._doarDbCollection.aggregate(pipeline);
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
                    linkedin: alumni.linkedin,
                    membership: alumni.membership,
                    location: alumni.location || "N.A.",
                    fortune500: alumni.fortune500,
                    qs100: alumni.qs100,
                    school: alumni.school || "N.A.",
                    regNo: alumni.regNumber || "N.A.",
                    country: alumni.country || "N.A."
                },
                alumni.company || "N.A.",
                alumni.prev_work.length > 0 ? this._getCompany(alumni.prev_work, searchText) : "N.A.",
                latestEducationInstitution,
                AlumniLSStatus.getAlumniLIStatus(alumni)
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

    private async _getFilterOptions(filterID: string, filtersApplied: any, searchText: string): Promise<Array<Array<any>>> {
        const matchQuery: any = {
            $match: {}
        };
        matchQuery["$match"][this._filterKeyMap[filterID]] = {
            $exists: true,
            $ne: ""
        };

        matchQuery["$match"] = this._getMatchFilters(filtersApplied, matchQuery["$match"]);

        const pipeline = [
            {
                $match: {
                    $or: this._getSearchFields(searchText)
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
        
        const result = await (await this._doarDbCollection.aggregate(pipeline)).toArray();
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

    private async _getFilters(filterNames: Array<string>, filtersApplied: any, searchText: string): Promise<object> {
        const filters: any = {};
        for (var i = 0; i < filterNames.length; i++) {
            const filterName: string = filterNames[i];
            filters[filterName] = await this._getFilterOptions(filterName, filtersApplied, searchText);
        }
        return filters;
    }

    async getAlumniListHavingLinkedIn(): Promise<String> {
        const cursor = await this._doarDbCollection.find({
            linkedin: {
                $ne: ""
            }
        });
        const records = await cursor.toArray();
        
        let csv = "S. No.,Name,Almashines Alumni ID,LinkedIn\n";
        records.forEach((doc: any, index: number) => {
            const row = [
                index + 1,
                `"${doc.name}"`,
                doc.alumniId || "",
                `"${doc.linkedin}"`
            ].join(",");
            csv += row + "\n";
        });

        return csv;
    }

    async getHomeFilters(filtersApplied: any, searchText: string): Promise<object> {
        const standardFilters: any = await this._getFilters(Object.keys(this._filterKeyMap), filtersApplied, searchText);
        if (standardFilters["Syncing Status"]) {
            standardFilters["Syncing Status"] = standardFilters["Syncing Status"].map((syncingStatusFilter: any) => {
                if (syncingStatusFilter[0] == "nl") {
                    return [
                        "Not Syncing",
                        syncingStatusFilter[1]
                    ];
                } else if (syncingStatusFilter[0] == "l") {
                    return [
                        "Currently Syncing",
                        syncingStatusFilter[1]
                    ];
                } else {
                    return [
                        "LinkedIn Not Linked",
                        syncingStatusFilter[1]
                    ];
                }
            });
        }
        if (standardFilters["Latest Status"]) {
            standardFilters["Latest Status"] = standardFilters["Latest Status"].map((latesetStatusFilter: any) => {
                if (latesetStatusFilter[0] == "f") {
                    return [
                        "Sync Failed",
                        latesetStatusFilter[1]
                    ];
                } else if (latesetStatusFilter[0] == "s") {
                    return [
                        "Successfully Synced",
                        latesetStatusFilter[1]
                    ];
                } else {
                    return [
                        "Never Synced",
                        latesetStatusFilter[1]
                    ];
                }
            });
        }
        return standardFilters;
    }

    async getAlumniCompanies(alumniId: string): Promise<Array<string>> {
        const result = await (await this._doarDbCollection.aggregate([
            {
                $match: {
                    alumniId: alumniId
                }
            },
            {
                $project: {
                    companies: {
                        $setUnion: [
                            {
                                $cond: {
                                    if: {
                                        $isArray: "$company"
                                    }, then: "$company",
                                    else: ["$company"]
                                }
                            },
                            {
                                $ifNull: [{
                                    $map: {
                                        input: "$prev_work",
                                        as: "work",
                                        in: "$$work.company"
                                    }
                                }, []
                            ]}
                        ]
                    }
                }
            },
            {
                $unwind: "$companies"
            },
            {
                $group: {
                    _id: null,
                    companies: {
                        $addToSet: "$companies"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    companies: 1
                }
            }
        ])).toArray();
        if (result.length > 0) {
            return result[0].companies;
        } else {
            return [];
        }
    }

    async getAlumniEducationalInstitutions(alumniId: string): Promise<Array<string>> {
        const result = await (await this._doarDbCollection.aggregate([
            {
                $match: {
                    alumniId: alumniId
                } 
            },
            {
                $unwind: "$education"
            },
            {
                $group: {
                    _id: null,
                    institutions: {
                        $addToSet: "$education.institution"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    institutions: 1
                }
            }
        ])).toArray();
        if (result.length > 0) {
            return result[0].institutions;
        } else {
            return [];
        }
    }

    async getAlumniLI(alumniId: string): Promise<string> {
        const alumniLIData: Document | null = await this._doarDbCollection.findOne({
            alumniId: alumniId
        }, {
            projection: {
                linkedin: 1
            }
        });
        if (alumniLIData == null || alumniLIData.linkedin == null) {
            return "";
        }
        return alumniLIData.linkedin;
    }

    async getAlumniIDFromLI(alumniLI: string): Promise<string> {
        const alumni: Document | null = await this._doarDbCollection.findOne({
            linkedin: alumniLI
        }, {
            projection: {
                alumniId: 1
            }
        });
        if (alumni == null || alumni.alumniId == null) {
            return "";
        }
        return alumni.alumniId;
    }

    async updateAlumniLIData(alumniId: string, alumniData: any) {
        let updateObject: any = {};
        for (let key in alumniData) {
            updateObject["liStatus." + key] = alumniData[key];
        }
        await AlumniLSStatus.updateAlumniLIStatus(alumniId, updateObject, this._doarDbCollection);
    }

    async getAlumniDataLastUpdatedTime(): Promise<number> {
        const almaShineDataDetails: Document[] = await (await this._doarCollection.find({
            desc: "Alumni Data Details"
        })).project({
            dataUpdatedAt: 1
        }).toArray();
        if (almaShineDataDetails == null || almaShineDataDetails.length === 0) {
            console.error("Almashine Data Update Time Data Corrupted.");
            return 0;
        } else {
            if (almaShineDataDetails[0] == null || almaShineDataDetails[0]["dataUpdatedAt"] == null) {
                console.error("Almashine Data Update Time Data Corrupted.");
                return 0;
            } else {
                return almaShineDataDetails[0]["dataUpdatedAt"];
            }
        }
    }

    async currentAlumniDataIsEligibleForSyncing(): Promise<boolean> {
        return ((currentTime() - await this.getAlumniDataLastUpdatedTime()) <= 604800);
    }

    async getAllAlumniIDsandLIs(getOnlyThoseWhichHaveNotBeenSyncedInTheLastYear: boolean = false): Promise<Document[]> {
        const filterToApply: any = {
            linkedin: {
                $ne: ""
            }
        };
        if (getOnlyThoseWhichHaveNotBeenSyncedInTheLastYear) {
            filterToApply["liStatus.lastUpdated"] = "-";
        } else {
            filterToApply["liStatus.currentStatus"] = {
                $ne: "l"
            };
        }
        const alumniList: Document[] = await (await this._doarDbCollection.find(filterToApply)).project({
            linkedin: 1,
            alumniId: 1
        }).limit(40).toArray();
        return alumniList;
    }

    private _generateWordCombinations(sentence1: string, sentence2: string, callback: Function) {
        const words1 = sentence1.split(" ");
        const words2 = sentence2.split(" ");
    
        for (let i = 0; i < words1.length; i++) {
            const word1 = words1[i];
            callback(word1, words2[0]);
            for (let j = 1; j < words2.length; j++) {
                callback(word1, words2.slice(0, j + 1).join(" "));
            }
        }
    
        for (let i = 0; i < words2.length; i++) {
            const word2 = words2[i];
            callback(words1[0], word2);
            for (let j = 1; j < words1.length; j++) {
                callback(words1.slice(0, j + 1).join(" "), word2);
            }
        }
    }

    async getAlumniCompaniesInstitutionsAndLocation(alumniId: string): Promise<object> {
        const result: any = {};
        
        const alumniData: Document[] = await (await this._doarDbCollection.find({
            alumniId: alumniId
        })).project({
            company: 1,
            designation: 1,
            "prev_work.company": 1,
            "prev_work.designation": 1,
            "education.institution": 1,
            "education.degree": 1,
            location: 1
        }).toArray();
        
        const currentCompany = alumniData[0].company;
        const currentDesignation = alumniData[0].designation;
        const otherWorkCompanies = alumniData[0].prev_work.map((work: any) => specialHash(work.company, work.designation));
        const allCompanies = [...otherWorkCompanies];
        this._generateWordCombinations(currentCompany.replaceAll("\n", " "), currentDesignation.replaceAll("\n", " "), (newCompany: string, newDesignation: string) => {
            allCompanies.push(specialHash(newCompany, newDesignation));
        });
        result.companies = allCompanies;

        result.institutions = alumniData[0].education.map((education: any) => specialHash(education.institution, education.degree));
        result.location = alumniData[0].location;

        return result;
    }

    async addAlumniEducation(alumniId: string, educationDetails: any) {
        const newEducation = {
            institution: educationDetails.institute,
            degree: educationDetails.degree,
            from: educationDetails.from,
            to: educationDetails.to
        };
        const result = await this._doarDbCollection.updateOne(
            {
                alumniId: alumniId
            },
            {
                $push: {
                    "education": newEducation
                }
            }
        );
        if (!(result.modifiedCount > 0)) {
            console.error(`Alumni DB Data Update Error (Education) for:\n\nAlumni ID: ${alumniId}\nData: ${JSON.stringify(educationDetails)}`);
        }
    }

    async addAlumniWorkExperience(alumniId: string, workDetailsData: any) {
        const workDetails = {
            company: workDetailsData.company,
            designation: workDetailsData.designation,
            untilWhen: workDetailsData.untilWhen
        }
        const result = await this._doarDbCollection.updateOne(
            {
                alumniId: alumniId
            },
            (workDetails.untilWhen !== "c") ? {
                $push: {
                    "prev_work": workDetails
                }
            } : {
                $set: {
                    "company": workDetails.company,
                    "designation": workDetails.designation
                }
            }
        );
        if (!(result.modifiedCount > 0)) {
            console.error(`Alumni DB Data Update Error (Work Experience) for:\n\nAlumni ID: ${alumniId}\nData: ${JSON.stringify(workDetails)}`);
        }
    }

    async updateAlumniLocation(alumniId: string, location: string, country: string) {
        const toUpdate: any = {
            "location": location
        };
        if (country != null && country.replaceAll(" ", "") !== "" && country !== "N.A.") {
            toUpdate["country"] = country;
        }
        const result = await this._doarDbCollection.updateOne(
            {
                alumniId: alumniId
            },
            {
                $set: toUpdate
            }
        );
        if (!(result.modifiedCount > 0)) {
            console.error(`Alumni DB Data Update Error (Location) for:\n\nAlumni ID: ${alumniId}\nData: ${JSON.stringify(location)}`);
        }
    }

}

export default DoARDataManager;