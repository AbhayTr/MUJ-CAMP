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
        const PROMPT = `
        
            Hello Gemini. Now understand my instructions very carefully. I have a MongoDB Database which basically stores data for my college's alumni data. That database has a collection which is named as "doar_db". That collection has documents, where each document represents one alumni. The structure of the document is as follows:

            {
                "_id": {
                  "$oid": any random mongodb id
                },
                "name": Name of the Alumni (eg. "Abhay Tripathi"),
                "gender": Gender of the Alumni (eg. "male", "female", "not specified", etc.),
                "muj_from": Year in which the alumni enrolled in our college (eg. 2021),
                "muj_to": Year in which the alumni graduated from our college (eg. 2025),
                "degree": Degree with specialization which the alumni pursued in our college (eg. "B.Tech (Computer Science and Engineering)"),
                "school": School to which the alumni belonged to in our college (eg. "School of Computer Science and Engineering"),
                "faculty": Faculty to which the alumni belonged to in our college (eg. "Faculty of Engineering"),
                "designation": The current designation of the alumni in their current company (eg. "Software Engineer"),
                "company": The current company in which the alumni is working (eg. "Google"),
                "prev_work": [ // Previous Work experience of the alumni in the form of a list of each experience's data.
                    {
                        "designation": The designation of the alumni in this experience (eg. "Network Engineer"),
                        "company": The company of the alumni in this experience (eg. "Cisco"),
                        "untilWhen": The year till which the alumni was working in that experience (eg. 2021)
                    },
                    // One more example of previous work data.
                    {
                        "designation": "Full Stack Web Developer",
                        "company": "Manipal University Jaipur",
                        "untilWhen": "2023"
                    }
                ],
                "education": [ // Other education qualification of the alumni apart from our college in the form of a list of each qualification's data.
                    {
                        "institution": The name of the institution where the alumni pursued the education in this qualification (eg. "Harvard University"),
                        "degree": The degree which the alumni pursued in this qualification (eg. "Bachelor of Science in Computer Science"),
                        "from": Year in which the alumni enrolled in the institution in this qualification (eg. 2025),
                        "to": Year in which the alumni graduated in this qualification (eg. 2030)
                    },
                    // One more example of previous qualification data.
                    {
                        "institution": "Delhi Public School (DPS), Sector - 45, Gurgaon (Gurugram)",
                        "degree": "High School Diploma",
                        "from": "2007",
                        "to": "2021"
                    }
                ],
                "phone": The phone number of the alumni (eg. "+91-8800958568"),
                "email": The email of the alumni (eg. "abhay-tripathi@live.com"),
                "location": The current location of the alumni where the alumni is residing (eg. "Gurgaon, Haryana, India"),
                "country": The current country where the alumni is residing (eg. "India"),
                "alumniId": Our System ID for the alumni (eg. "3442655"),
                "linkedin": LinkedIn URL of the alumni (eg. "https://linkedin.com/in/abhaytri"),
                "liStatus": { // This is the status of the alumni's linkedin data syncing and updation.
                    "lastUpdated": A timestamp which tells when the data was last synced successfully (eg. 1714470784). If it is "-", it means that data has been never synced from linkedin for this alumni,
                    "latestStatus": Single character to depict the last status of the alumni's linkedin data syncing update. "s" means data was updated successfully and "f" means that the data was not updated successfully,
                    "currentStatus": String which depicts the current status of the updation process of the Alumni Data. "l" means that the data is currently being synced from LinkedIn for the alumni, "nl" means that the data is current not being synced from LinkedIn for that alumni, and "-" means that there is no linkedin url available to the system for this alumni and hence data syncing is not possible.
                }
            }

            Remember for all the data fields in the document, the value can also be "N.A.", "" or null. So you have to remember to handle those as well, if required.

            Now that you have understood the data structure, let me explain what you have to do. Basically I am visualsing this data in the form of a dashboard. In the dashboard, there are 2 kinds of data: "graph" (Bar Graph) and "stat" (Simple Numerical Count). I also refer to these as "visuals". There can be any number of visuals in the dashboard, either of the type "graph" or "stat". Now the dashboard manager wants to add a new "visual". The "visual" can either be of the kind "graph" or "stat" as I mentioned before. But, how do we know the type of the new visual, also how do we get to know what data should be extracted exactly to match the requirements of the new "visual". Well, that's where you come in!

            So basically to create a new "visual", the dashboard manager will give a prompt which will explain what kind of data is required for the new visual, and also what kind of "visual" it will be. That prompt will be given to you as an input. Your first job is to analyze and understand the input prompt, and figure the type of the new "visual" i.e. whether the new visual will be a "graph" or a "stat". Then you must analyze what kind of data is being seeked. But now you might be thinking how can you extract the data which is required for the new visual, and also which format you should follow for the data output, to suite my application. Well, let's talk about that further.
            
            You must be aware that in MongoDB NodeJS driver we can directly execute queries using the db.command() function. In this function, we have to pass a JSON parameter whose structure is as follows, if I have to run an aggregation:

            {
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
                            "title": "Alumni Count by Country", // Title of the result set.
                            "total": "$total", // This attribute has to be present only if the visual type is graph, else not.
                            "data": "$data", // Data for the visual.
                            "type": "graph", // Type of the visual being created.
                            "color": "green", // Color of the visual data.
                            "unit": "Alumni" // Unit of the dataset.
                        }
                    }
                ]
            }

            Now as you can see, I am running an MongoDB Command using which I can fetch our college's alumni distribution country wise i.e. the number of alumni living in each country, in the format which I want for my application. Now understand the format in which I want the data output, which I get after running the query. The format is as follows:

            {
                "title": A title which you will have to generate based on the type of request being made. You have to infer this from the prompt given to you after analyzing the request (eg. "Alumni Count by Country").
                "total": This field is only required if the type of the visual is "graph", else not. It is basically the summation of all types of data to give the total no. of data points involved in this visual (eg. 10000),
                "data": The dataset which is required for the visual. Now the "data" field itself has a structure depending on the visual type:

                    If the visual type is "graph", then it will be a list of all the datapoints with the following format:

                        [
                            {
                                key: The key of the data point (eg. "India"),
                                data: The data (value) of the data point (eg. 9000)
                            },
                            and so on...
                        ]

                    If the visual type is "stat", then it will simply be a number depiciting the statistic require (eg. 8000).,

                "type": Type of the visual being created. It can strictly be only either "graph" or "stat".,
                "color": Color of the visual being created. It is used to represent the visual data. Just use either "green", "blue" or "orange" for this i.e. pick randomly from these 3 colors.,
                "unit": The unit of the visual data set. You have to infer this from the prompt and what kind of data is required. If you are unable to decide any unit, then simply use "Alumni".
            }

            So now you know my output structure. So your job is basically to analyze the input prompt given to you, decide on the visual type ("graph" or "stat"), visual title which best suites the visual data (keep it under 15 words), visual color and visual unit. Then you have to come up with a MongoDB Query JSON Object, which when I execute using the db.command() function, I get the output in my required format as I explained above. In the query, use the details as required and as I stated above.
            
            Once you have created the Query Object, then you have to simply return a single line string of your generated JSON. Remember to put double quotes ("") on all the keys of the JSON Object, so that your generated string can be parsed using JSON.parse() function in TypeScript.

            Now remember you can generate only 2 kind of outputs for this work:

            Either return the String of the JSON Object of the MongoDB Query, which satisfies the above stated requirements.

            Or if you cannot generate the Query due to any kind of reason (Offensive Language, Unable to understand, etc.) simply generate "np" string, that's it.

            Apart from these 2 outputs, you can't include any other words, text, data, etc. in the output. I am telling you this, because my application will directly parse your output, and process the new visual by running your given command using db.command() function with your query JSON Object as the query parameter.

            Remember few things:

            Before giving the output thoughroughly ensure that the output format is being followed i.e. the visual type, title, color, unit, total (if type is "graph"), and data is there. Also, strictly adhere to my database data format as I explained above.

            Also keep in mind the following:

            - For countries, use their full names only. For eg. for USA use United States of America.

            - In case of visuals of the type "graph", ensure that the data points are sorted based on the "data" of the data points. This can be achieved using the "$sort" aggregator.

            ${(prevPrompt === "") ? "" : `
            
            You should know that this input prompt is coming as a request to update an existing visual. The prompt which was used to create this visual was as follows:

            ${prevPrompt}

            Your job is to understand the new requirement with respect to this new visual, and give the output as I explained above.

            `}

            Now that you have understood your job, here is the input prompt:

            "${prompt}"

            Thoroughly ensure that your output is parsable by JSON.parse() JS Function. Also dont use "\\" in your string output as they could cause problems with JSON.parse() function.

            For eg. in this kind of output:

            "{
                \"aggregate\": \"doar_db\",
                \"cursor\": {},
                \"pipeline\": [
                  {
                    \"$match\": {
                      \"country\": {
                        \"$in\": [
                          \"United States of America\",
                          \"Japan\"
                        ]
                      },
                      \"country\": {
                        \"$ne\": null
                      }
                    }
                  },
                  {
                    \"$group\": {
                      \"_id\": {
                        \"country\": \"$country\"
                      },
                      \"count\": {
                        \"$sum\": 1
                      }
                    }
                  },
                  {
                    \"$project\": {
                      \"_id\": 0,
                      \"data\": \"$count\",
                      \"key\": \"$_id.country\"
                    }
                  },
                  {
                    \"$sort\": {
                      \"data\": -1
                    }
                  },
                  {
                    \"$group\": {
                      \"_id\": null,
                      \"total\": {
                        \"$sum\": \"$data\"
                      },
                      \"data\": {
                        \"$push\": \"$$ROOT\"
                      }
                    }
                  },
                  {
                    \"$project\": {
                      \"_id\": 0,
                      \"title\": \"Alumni Count in USA and Japan\",
                      \"total\": \"$total\",
                      \"data\": \"$data\",
                      \"type\": \"graph\",
                      \"color\": \"green\",
                      \"unit\": \"Alumni\"
                    }
                  }
                ]
              }"

            You can clearly see that their are "\" in the string which will cause problem with JSON.parse(). So please ensure not to use "\" in your string output. Always ensure that your string output could be parsed by JSON.parse() function. Or else my program would crash. Please ensure.

            In the "$project" field, ensure that you have set the "title", "total" (if visual type is "graph"), "data", "color" and "unit" thoroughly. If you won't, then my program will crash. Please ensure.

            Also please always ensure, that if the type of the visual is "stat", then the "data" field in the project should be of numerical format, and if the type of the visual is "graph", then the "data" field is of the format as I have mentioned above (list of {"key": %KEY%, "data": %DATA%}). Please ensure this, else my program will crash.

            Also, in case the visual is of the type "graph", then just sort the graph based on the values in the graph, in the descending order, so that the largest values are shown first, and so on. Please ensure.

            Also remember that for anything related to companies, you have to take into consideration the current company details, along with the previous work ("prev_work") of the alumni as well.

            Now you have your input prompt. Analyze it and give the output as I have explained to you above. Good Luck. Thanks.

        `;
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
                        console.log(generatedQuery);
                        if (generatedQuery.toLowerCase() != "np") {
                            if ((generatedQuery[0] === `"` && generatedQuery[generatedQuery.length - 1] === `"`) || (generatedQuery[0] === `'` && generatedQuery[generatedQuery.length - 1] === `'`)) {
                                generatedQuery = generatedQuery.substring(1, generatedQuery.length - 1);
                            }
                            generatedQuery = JSON.parse(generatedQuery);
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