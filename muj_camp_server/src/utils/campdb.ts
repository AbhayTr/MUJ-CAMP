import { MongoClient, Db, Collection, Document, RunCommandOptions } from "mongodb";

class CAMPDB {

    private _mongoClient: any;
    private _mongoDb!: Db;

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            MongoClient.connect(process.env.DB_URL!)
            .then(db => {
                this._mongoClient = db;
                this._mongoDb = db.db(process.env.DB_NAME);
                resolve();
            })
            .catch(error => {
                reject(error);
            });
        });
    }

    collection(collectionName: string): CAMPCollection {
        return new CAMPCollection(this._mongoDb, collectionName);
    }

    async command(command: object, options?: RunCommandOptions | undefined): Promise<Document> {
        return await this._mongoDb.command(command, options);
    }

    close() {
        this._mongoClient.close();
    }

}

class CAMPCollection {

    private _mongoCollection: Collection;

    constructor(mongoDb: Db, collectionName: string) {
        this._mongoCollection = mongoDb.collection(collectionName);
    }

    async findOne<type>(...params: Parameters<Collection["findOne"]>) {
        return this._mongoCollection.findOne<type>(...params);
    }

    async find(...params: Parameters<Collection["find"]>) {
        return this._mongoCollection.find(...params);
    }

    async insertOne(...params: Parameters<Collection["insertOne"]>) {
        return this._mongoCollection.insertOne(...params);
    }

    async insertMany(...params: Parameters<Collection["insertMany"]>) {
        return this._mongoCollection.insertMany(...params);
    }

    async updateOne(...params: Parameters<Collection["updateOne"]>) {
        return this._mongoCollection.updateOne(...params);
    }

    async updateMany(...params: Parameters<Collection["updateMany"]>) {
        return this._mongoCollection.updateMany(...params);
    }

    async deleteOne(...params: Parameters<Collection["deleteOne"]>) {
        return this._mongoCollection.deleteOne(...params);
    }

    async deleteMany(...params: Parameters<Collection["deleteMany"]>) {
        return this._mongoCollection.deleteMany(...params);
    }

    async aggregate(...params: Parameters<Collection["aggregate"]>) {
        return this._mongoCollection.aggregate(...params);
    }

    async drop(...params: Parameters<Collection["drop"]>) {
        return this._mongoCollection.drop(...params);
    }

    async countDocuments(...params: Parameters<Collection["countDocuments"]>) {
        return this._mongoCollection.countDocuments(...params);
    }

    async createIndex(...params: Parameters<Collection["createIndex"]>) {
        return this._mongoCollection.createIndex(...params);
    }

}

export { CAMPDB, CAMPCollection };