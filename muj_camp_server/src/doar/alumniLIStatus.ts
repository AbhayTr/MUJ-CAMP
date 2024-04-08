class AlumniLSStatus {

    static getAlumniLIStatus(alumni: any): object {
        return {
            lastUpdated: alumni.liStatus.lastUpdated || "-",
            latestStatus: alumni.liStatus.latestStatus || "-",
            currentStatus: alumni.liStatus.currentStatus || ((alumni.linkedin === "") ? "-" : "nl")
        };
    }

}

export default AlumniLSStatus;