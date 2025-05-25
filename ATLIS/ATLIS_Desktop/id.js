fetch(`https://www.signalhire.com/_/candidates/search?term=${process.argv[3]}`, {
    "headers": {
      "accept": "*/*",
      "accept-language": "en,hi;q=0.9,kn;q=0.8",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
      "cookie": process.argv[2],
      "Referer": "https://www.signalhire.com/candidates/3c4f94c0b61d4f999d1bf0b6093f3fcb",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "GET"
  }).then(r => {r.json().then(t => {console.log(JSON.stringify({
    "status": "s",
    "shid": t["candidates"][0]["id"]
  }));
});});