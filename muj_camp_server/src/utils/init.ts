import { currentTime, timestampToHumanTime } from "./common";

const printError = console.error;
console.error = (error) => {
    printError(`${timestampToHumanTime(currentTime())}: ${error}`);
}

declare global {
    interface String {
        toAlphaNumeric(): string;
        toTitleCase(): string;
    }
}

String.prototype.toAlphaNumeric = function() {
    return String(this).replace(/[^0-9a-z]/gi, "");
};

String.prototype.toTitleCase = function() {
    const str = String(this);
    var splitStr = str.toLowerCase().split(" ");
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(" "); 
};
  
export {};