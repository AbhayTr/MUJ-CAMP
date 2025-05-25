// static async getQuery(dashboardManager: DOARDashboardManager, prompt: string, prevPrompt?: string, retryLoop: number = 0, generatedQuery: string = "", queryError: string = "", executionFailed = false): Promise<object> {
//     const PROMPT = (retryLoop === 0) ? getPrompt(prompt, prevPrompt) : (executionFailed) ? getExecutionCorrectionPrompt(queryError, prompt, generatedQuery, prevPrompt) : getCorrectionPrompt(queryError, prompt, generatedQuery, prevPrompt);
//     const requestBody: any = {
//         "contents": [
//             {
//                 "role": "user",
//                 "parts": [
//                     {
//                         "text": PROMPT
//                     }
//                 ]
//             }
//         ]
//     };
//     return new Promise((resolve) => {
//         fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
//             method: "POST",
//             body: JSON.stringify(requestBody)
//         })
//         .then((response) => {
//             response.text().then(async (rawData: any) => {
//                 try {
//                     const data = JSON.parse(rawData);
//                     var generatedQuery: any = data["candidates"][0]["content"]["parts"][0]["text"];
//                     if (generatedQuery.toLowerCase() != "np") {
//                         if ((generatedQuery[0] === `"` && generatedQuery[generatedQuery.length - 1] === `"`) || (generatedQuery[0] === `'` && generatedQuery[generatedQuery.length - 1] === `'`)) {
//                             generatedQuery = generatedQuery.substring(1, generatedQuery.length - 1);
//                         }
//                         eval(`generatedQuery = ${generatedQuery};`);
//                         const queryFormatCheck: string = this._isValidOutput(generatedQuery);
//                         if (queryFormatCheck === "s") {
//                             const queryResult: any = await dashboardManager.executeQuery(generatedQuery);
//                             if (!queryResult["error"]) {
//                                 const queryFormatResultCheck: string = this._isValidResult(queryResult);
//                                 if (queryFormatResultCheck === "s") {
//                                     resolve(generatedQuery);
//                                 } else {
//                                     if (retryLoop < parseInt(process.env.MAX_RETRY_LOOP!)) {
//                                         resolve(this.getQuery(dashboardManager, prompt, prevPrompt, ++retryLoop, JSON.stringify(generatedQuery), queryFormatResultCheck, true));
//                                     } else {
//                                         resolve({
//                                             error: "np"
//                                         });
//                                     }
//                                 }
//                             } else {
//                                 if (retryLoop < parseInt(process.env.MAX_RETRY_LOOP!)) {
//                                     resolve(this.getQuery(dashboardManager, prompt, prevPrompt, ++retryLoop, JSON.stringify(generatedQuery), queryResult["error"], true));
//                                 } else {
//                                     resolve({
//                                         error: "np"
//                                     });
//                                 }
//                             }
//                         } else {
//                             if (retryLoop < parseInt(process.env.MAX_RETRY_LOOP!)) {
//                                 resolve(this.getQuery(dashboardManager, prompt, prevPrompt, ++retryLoop, JSON.stringify(generatedQuery), queryFormatCheck));
//                             } else {
//                                 resolve({
//                                     error: "np"
//                                 });
//                             }
//                         }
//                     } else {
//                         resolve({
//                             error: "np"
//                         });
//                     }
//                 } catch (err) {
//                     resolve({
//                         error: err
//                     });
//                 }
//             });
//         })
//         .catch((error) => {
//             resolve({
//                 error: error
//             })
//         });
//     });
// }