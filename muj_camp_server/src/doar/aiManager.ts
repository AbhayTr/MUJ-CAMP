import { getPrompt } from "../utils/doarData";

class AIManager {

    private static _isValidOutput(query: any): boolean {
        if (query.aggregate == null || query.cursor == null || query.pipeline == null) {
            return false;
        }
        if (query.pipeline[query.pipeline.length - 1]["$project"] == null) {
            return false;
        }
        const finalOutput = query.pipeline[query.pipeline.length - 1]["$project"];
        if (finalOutput.title == null || finalOutput.data == null || finalOutput.type == null || finalOutput.color == null || finalOutput.unit == null) {
            return false;
        }
        if (finalOutput.type === "graph" && finalOutput.total == null) {
            return false;
        }
        if (finalOutput.type === "stat" && isNaN(finalOutput.data)) {
            return false;
        }
        return true;
    }

    static async getQuery(prompt: string, prevPrompt?: string): Promise<object> {
        const PROMPT = getPrompt(prompt, prevPrompt);
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
                        var generatedQuery: any = data["candidates"][0]["content"]["parts"][0]["text"];
                        if (generatedQuery.toLowerCase() != "np") {
                            if ((generatedQuery[0] === `"` && generatedQuery[generatedQuery.length - 1] === `"`) || (generatedQuery[0] === `'` && generatedQuery[generatedQuery.length - 1] === `'`)) {
                                generatedQuery = generatedQuery.substring(1, generatedQuery.length - 1);
                            }
                            eval(`generatedQuery = ${generatedQuery};`);
                            console.log(JSON.stringify(generatedQuery));
                            if (this._isValidOutput(generatedQuery)) {
                                resolve(generatedQuery);
                            } else {
                                resolve({
                                    error: "np"
                                });    
                            }
                        } else {
                            resolve({
                                error: "np"
                            });
                        }
                    } catch (err) {
                        console.log(err);
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