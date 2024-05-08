class AIManager {

    static async getQuery(prompt: string, prevPrompt?: string): Promise<object> {
        const PROMPT = `
        
            Hello Gemini. Now understand my instructions very carefully. I have a MongoDB Database which basically stores data for my college's alumni data. That database has a collection which is named as "doar_db". That collection has documents, where each document represents one alumni. The structure of the document is as follows:

            {
                "_id": {
                  "$oid": "any random id"
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
                    "from": Year in which the alumni enrolled in the institution in this qualification (eg. 2007),
                    "to": Year in which the alumni graduated in this qualification (eg. 2012)
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
                        var generatedQuery: string = data["candidates"][0]["content"]["parts"][0]["text"];
                        if (generatedQuery.toLowerCase() != "NP") {
                            generatedQuery = JSON.parse(generatedQuery);
                        }
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