fetch(`https://www.signalhire.com/_/candidates/${process.argv[3]}`, {
  "headers": {
    "accept": "*/*",
    "accept-language": "en,hi;q=0.9,kn;q=0.8",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "cookie": process.argv[2],
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest",
    "Referer": "https://www.signalhire.com/candidates/f1e57e50c0394ef7ab88e2012e439789",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": null,
  "method": "GET"
}).then(r => {r.text().then(t => {console.log(JSON.stringify({
  "status": "s",
  "data": JSON.parse(t)
}));});});