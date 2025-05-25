// eslint-disable-next-line no-extend-native
String.prototype.toTitleCase = function() {
    const str = String(this);
    var splitStr = str.split(" ");
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(" "); 
};