import { currentTime, timestampToHumanTime } from "./common";

const printError = console.error;
console.error = (error) => {
    printError(`${timestampToHumanTime(currentTime())}: ${error}`);
}

declare global {
    interface String {
        toAlphaNumeric(): string;
    }
}

String.prototype.toAlphaNumeric = function() {
    return String(this).replace(/[^0-9a-z]/gi, "");
};
  
export {}