import Groq from "groq-sdk";

import DOARDashboardManager from "./dashboardManager";
import { getPrompt, getCorrectionPrompt, getExecutionCorrectionPrompt } from "./doarData";

class AIManager {

    private static _isValidOutput(query: any): string {
        if (query.aggregate == null || query.cursor == null || query.pipeline == null) {
            return `
            Query's "aggregate" is missing, or query's "cursor" is missing or "pipeline" is missing.

            Here are the variables output for your reference:

            query.aggregate = ${query.aggregate}
            query.cursor = ${query.cursor}
            query.pipeline = ${query.pipeline}

            `;
        }
        if (query.pipeline[query.pipeline.length - 1]["$project"] == null) {
            return `Query's "pipeline"'s "$project" is missing.

            Here are the variables output for your reference:
            
            query.pipeline[query.pipeline.length - 1]["$project"] = ${query.pipeline[query.pipeline.length - 1]["$project"]}

            `;
        }
        const finalOutput = query.pipeline[query.pipeline.length - 1]["$project"];
        if (finalOutput.title == null || finalOutput.data == null || finalOutput.type == null || finalOutput.color == null || finalOutput.unit == null) {
            return `Query's "pipeline's" "$project's" either "title", "data", "type", "color" or "unit" is missing.
            
            Here are the variables output for your reference:

            const finalOutput = query.pipeline[query.pipeline.length - 1]["$project"];
            finalOutput.title = ${finalOutput.title}
            finalOutput.data = ${finalOutput.data}
            finalOutput.type = ${finalOutput.type}
            finalOutput.color = ${finalOutput.color}
            finalOutput.unit = ${finalOutput.unit}

            `;
        }
        if (finalOutput.type === "graph" && finalOutput.total == null) {
            return `
            Query's "pipeline's" "$project's" "total" is null. It should be a number containing the sum of all data sets as mentioned before.

            Here are the variables output for your reference:

            const finalOutput = query.pipeline[query.pipeline.length - 1]["$project"];
            finalOutput.total = ${finalOutput.total}

            `;
        }
        if (finalOutput.type === "stat" && typeof(finalOutput.data) == "object") {
            return `Query is for a Visual whose type is "stat", hence it is expected that the "data" should be of the following format:

            A numerical variable depicting the numerical data i.e. the statistic being asked.

            But it is not.

            Here are the variables output for your reference:

            const finalOutput = query.pipeline[query.pipeline.length - 1]["$project"];
            finalOutput.data = ${finalOutput.data}

            `;
        }
        return "s";
    }

    private static _isValidResult(result: any): string {
        if (result.title == null || result.data == null || result.type == null || result.color == null || result.unit == null) {
            return `
            
            The result generated after executing the query either misses "title", "data", "type", "color" or "unit".

            Here are the variables output for your reference:

            result.title = ${result.title}
            result.data = ${result.data}
            result.type = ${result.type}
            result.color = ${result.color}
            result.unit = ${result.unit}
            
            `;
        }
        if (result.type === "graph" && (result.total == null || typeof(result.data) != "object")) {
            return `The result generated after executing the query is for a Visual whose type is "graph", hence it is expected that the "data" should be of the following format:

            [
                {
                    key: The key of the data point (eg. "India"),
                    data: The data (value) of the data point (eg. 9000)
                },
                and so on...
            ]

            But it is not. Also, "total" may also be null. It should be a number containing the sum of all data sets as mentioned before. So check for both.

            Here are the variables output for your reference:

            result.data = ${result.data}
            result.total = ${result.total}

            `;
        }
        if (result.type === "graph" && (result.data[0].data == null || result.data[0].key == null)) {
            return `The result generated after executing the query is for a Visual whose type is "graph", hence it is expected that the "data" should be of the following format:

            [
                {
                    key: The key of the data point (eg. "India"),
                    data: The data (value) of the data point (eg. 9000)
                },
                and so on...
            ]

            But it is not. So please ensure the data is represented in the key, data format as mentioned above.

            Here are the variables output for your reference:

            result.data = ${result.data}

            `;
        }
        if (result.type === "stat" && isNaN(result.data)) {
            return `The result generated after executing the query is for a Visual whose type is "stat", hence it is expected that the "data" should be of the following format:

            A numerical value depicting the numerical data i.e. the statistic being asked.

            But it is not. It is some random object ${result.data}.

            `;
        }
        return "s";
    }

    static extractTimeAndFormat(input: string): string {
        const timeRegex = /(\d+)m(\d+)\.\d+s/;
        const match = input.match(timeRegex);
        if (match) {
            const minutes = match[1];
            const seconds = match[2];
            return `${minutes} Minutes, ${seconds} Seconds`;
        }
        return "";
    }

    static async getQuery(dashboardManager: DOARDashboardManager, prompt: string, prevPrompt?: string, retryLoop: number = 0, generatedQuery: string = "", queryError: string = "", executionFailed = false, modelNumber = 0): Promise<object> {
        
        const models = [
            "llama-3.1-70b-versatile"
        ];

        const groq: Groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
        const PROMPT = (retryLoop === 0) ? getPrompt(prompt, prevPrompt) : (executionFailed) ? getExecutionCorrectionPrompt(queryError, prompt, generatedQuery, prevPrompt) : getCorrectionPrompt(queryError, prompt, generatedQuery, prevPrompt);
        const requestBody: any = {
            messages: [
                {
                    role: "user",
                    content: PROMPT,
                }
            ],
            model: models[modelNumber]
        }
        return new Promise(async (resolve) => {
            try {
                var generatedQuery: any = (await groq.chat.completions.create(requestBody)).choices[0]?.message?.content;
                if (generatedQuery == null || generatedQuery == "") {
                    console.error("AI Agent Error.")
                    resolve({
                        error: "np"
                    });
                }
                try {
                    if (generatedQuery.toLowerCase() != "np") {
                        if ((generatedQuery[0] === `"` && generatedQuery[generatedQuery.length - 1] === `"`) || (generatedQuery[0] === `'` && generatedQuery[generatedQuery.length - 1] === `'`)) {
                            generatedQuery = generatedQuery.substring(1, generatedQuery.length - 1);
                        }
                        eval(`generatedQuery = ${generatedQuery};`);
                        const queryFormatCheck: string = this._isValidOutput(generatedQuery);
                        if (queryFormatCheck === "s") {
                            const queryResult: any = await dashboardManager.executeQuery(generatedQuery);
                            if (!queryResult["error"]) {
                                const queryFormatResultCheck: string = this._isValidResult(queryResult);
                                if (queryFormatResultCheck === "s") {
                                    resolve(generatedQuery);
                                } else {
                                    if (retryLoop < parseInt(process.env.MAX_RETRY_LOOP!)) {
                                        resolve(this.getQuery(dashboardManager, prompt, prevPrompt, ++retryLoop, JSON.stringify(generatedQuery), queryFormatResultCheck, true, modelNumber));
                                    } else {
                                        resolve({
                                            error: "np"
                                        });
                                    }
                                }
                            } else {
                                if (retryLoop < parseInt(process.env.MAX_RETRY_LOOP!)) {
                                    resolve(this.getQuery(dashboardManager, prompt, prevPrompt, ++retryLoop, JSON.stringify(generatedQuery), queryResult["error"], true, modelNumber));
                                } else {
                                    resolve({
                                        error: "np"
                                    });
                                }
                            }
                        } else {
                            if (retryLoop < parseInt(process.env.MAX_RETRY_LOOP!)) {
                                resolve(this.getQuery(dashboardManager, prompt, prevPrompt, ++retryLoop, JSON.stringify(generatedQuery), queryFormatCheck, false, modelNumber));
                            } else {
                                resolve({
                                    error: "np"
                                });
                            }
                        }
                    } else {
                        resolve({
                            error: "np"
                        });
                    }
                } catch (exception) {
                    if (retryLoop < parseInt(process.env.MAX_RETRY_LOOP!)) {
                        resolve(this.getQuery(dashboardManager, prompt, prevPrompt, ++retryLoop, JSON.stringify(generatedQuery), String(exception), false, modelNumber));
                    } else {
                        resolve({
                            error: "np"
                        });
                    }
                }
            } catch (appException) {
                if (String(appException).toLowerCase().includes("rate limit reached")) {
                    if (modelNumber < models.length - 1) {
                        resolve(this.getQuery(dashboardManager, prompt, prevPrompt, retryLoop, "", "", false, ++modelNumber));
                    } else {
                        const timeRemaining = this.extractTimeAndFormat(String(appException));
                        var errorMessage = "";
                        if (timeRemaining != "") {
                            errorMessage = "Due to free tier limits, no new visual can be generated, nor filters can be applied to existing visuals for " + timeRemaining + ". If the problem still persists after that time, please contact " + process.env.CONTACT_PERSON + ".";
                        } else {
                            errorMessage = "Due to free tier limits, no new visual can be generated, nor filters can be applied to existing visuals for sometime. Please try again after 1 hour. If the problem still persists, please contact " + process.env.CONTACT_PERSON + ".";
                        }
                        resolve({
                            error: errorMessage
                        });
                    }
                } else {
                    console.error("AI Agent Error: " + appException);
                    resolve({
                        error: "np"
                    });
                }
            }
        });
    }

}

export default AIManager;