class AIManager {

    static async getQuery(prompt: string, prevPrompt?: string): Promise<object> {
        const PROMPT = `${prompt}`;
        const requestBody: any = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": PROMPT
                        }
                    ]
                }
            ]
        };
        return new Promise((resolve) => {
            fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                method: "POST",
                body: JSON.stringify(requestBody)
            })
            .then((response) => {
                response.text().then((rawData: any) => {
                    try {
                        const data = JSON.parse(rawData);
                        const generatedQuery = data["candidates"][0]["content"]["parts"][0]["text"];
                        console.log(generatedQuery);
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
                    } catch (err) {
                        resolve({
                            error: err
                        });
                    }
                });
            })
            .catch((error) => {
                resolve({
                    error: error
                })
            });
        });
    }

}

export default AIManager;