import { CAMPDB } from "../utils/campdb";

class DoARDataManager {

    private _campdb!: CAMPDB;

    constructor(campdb: CAMPDB) {
        this._campdb = campdb;
    }

}

export default DoARDataManager;