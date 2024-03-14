import { MongoClient, Db, Collection } from "mongodb";

class CAMPDB {

    #mongoClient: any;
    #mongoDb!: Db;

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            MongoClient.connect(process.env.DB_URL!)
            .then(db => {
                this.#mongoClient = db;
                this.#mongoDb = db.db(process.env.DB_NAME);
                resolve();
            })
            .catch(error => {
                reject(error);
            });
        });
    }

    collection(collectionName: string): CAMPCollection {
        return new CAMPCollection(this.#mongoDb, collectionName);
    }

    close() {
        this.#mongoClient.close();
    }

}

class CAMPCollection {

    #mongoCollection: Collection;

    constructor(mongoDb: Db, collectionName: string) {
        this.#mongoCollection = mongoDb.collection(collectionName);
    }

    async findOne(...params: Parameters<Collection["findOne"]>) {
        return this.#mongoCollection.findOne(...params);
    }

    async find(...params: Parameters<Collection["find"]>) {
        return this.#mongoCollection.find(...params);
    }

    async insertOne(...params: Parameters<Collection["insertOne"]>) {
        return this.#mongoCollection.insertOne(...params);
    }

    async insertMany(...params: Parameters<Collection["insertMany"]>) {
        return this.#mongoCollection.insertMany(...params);
    }

    async updateOne(...params: Parameters<Collection["updateOne"]>) {
        return this.#mongoCollection.updateOne(...params);
    }

    async updateMany(...params: Parameters<Collection["updateMany"]>) {
        return this.#mongoCollection.updateMany(...params);
    }

    async deleteOne(...params: Parameters<Collection["deleteOne"]>) {
        return this.#mongoCollection.deleteOne(...params);
    }

    async deleteMany(...params: Parameters<Collection["deleteMany"]>) {
        return this.#mongoCollection.deleteMany(...params);
    }

    async aggregate(...params: Parameters<Collection["aggregate"]>) {
        return this.#mongoCollection.aggregate(...params);
    }

}

export { CAMPDB, CAMPCollection };