class AIManager {

    static async getQuery(prompt: string): Promise<object> {
        return new Promise((resolve, reject) => {
            const PROMPT = ``;
            resolve({
                "aggregate": "doar_db",
                "cursor": {},
                "pipeline": [
                    {
                        "$group": {
                            "_id": "$country",
                            "count": {
                                "$sum": 1
                            }
                        }
                    },
                    {
                        "$match": {
                            "_id": {
                                "$ne": ""
                            }
                        }
                    },
                    {
                        "$project": {
                            "_id": 0,
                            "data": "$count",
                            "key": "$_id"
                        }
                    },
                    {
                        "$sort": {
                            "data": -1
                        }
                    },
                    {
                        "$group": {
                            "_id": null,
                            "total": {
                                "$sum": "$data"
                            },
                            "data": {
                                "$push": "$$ROOT"
                            }
                        }
                    },
                    {
                        "$project": {
                            "_id": 0,
                            "title": "Alumni Count by Country",
                            "total": "$total",
                            "data": "$data",
                            "type": "graph",
                            "color": "green",
                            "unit": "Alumni"
                        }
                    }
                ]
            });
        });
    }

}

export default AIManager;