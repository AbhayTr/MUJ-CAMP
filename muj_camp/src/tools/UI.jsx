import successTune from "../assets/audio/success.mp3";
import errorTune from "../assets/audio/error.mp3";

import { alert, confirm } from "react-bootstrap-confirmation";
import { toast } from "react-toastify";

import { AuthStore } from "../app_state/auth/auth";
import { revokeSessionAccess } from "../app_state/auth/auth_actions";

const playSound = (soundCode) => {
    let sound = null;
    if (soundCode === "s") {
        sound = successTune;
    } else if (soundCode === "e") {
        sound = errorTune;
    } else {
        return;
    }
    new Audio(sound).play();
}

const showAlert = (message, messageTypeCallback = toast.success, sound = true) => {
    if (message[message.length - 1] === ".") {
        message = message.substring(0, message.length - 1);
    }
    if (sound === true) {
        if (messageTypeCallback === toast.success) {
            playSound("s");
        } else if (messageTypeCallback === toast.error) {
            playSound("e");
        }
    }
    messageTypeCallback(message, {
        position: "top-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined
    });
}

const confirmLogout = async (navigate, onCancel = null) => {
    if (await confirm(`Are you sure you want to leave, ${AuthStore.getState().authName} 🤨`, {
        title: "Are you sure?",
        okText: "Yes 😎",
        cancelText: "No pressed by mistake 😅",
        okButtonStyle: "danger",
        cancelButtonStyle: "warning"
    })) {
        showAlert(`Ok bye bye, ${AuthStore.getState().authName} 👋`);
        AuthStore.dispatch(revokeSessionAccess());
        navigate(`${process.env.REACT_APP_PATH_ROOT}/`);
    } else {
        if (onCancel != null) {
            onCancel();
        }
    }
}

const showCredits = async () => {
    await alert((
        <>
            Designed and Developed solely by:<br/>
            <b>Abhay Tripathi (B.Tech CSE 2021 to 2025)</b>
            <br/><br/>
            &copy; {new Date().getUTCFullYear()} Manipal University Jaipur (MUJ)<br/>
            &copy; {new Date().getUTCFullYear()} Manipal University Jaipur Alumni Association (MUJAA)<br/>
            &copy; {new Date().getUTCFullYear()} Software Development Center (SDC), Department of Computer Science and Engineering, Manipal University Jaipur (MUJ)<br/>
            <br/>
            &copy; Abhay Tripathi, All Rights Reserved.<br/>
            &copy; Swayam Labs, All Rights Reserved.
        </>), {
        okText: "Got it 👍",
        okButtonStyle: "success"
    });
}

const timestampToHumanTime = (timestamp) => {
    const monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    const date = new Date(timestamp * 1000);
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
    const am_pm = date.getHours() >= 12 ? "PM" : "AM";
    const hour12 = date.getHours() % 12 || 12;

    let dayWithSuffix;
    switch (day) {
        case "01":
        case "21":
        case "31":
            dayWithSuffix = day + "st";
            break;
        case "02":
        case "22":
            dayWithSuffix = day + "nd";
            break;
        case "03":
        case "23":
            dayWithSuffix = day + "rd";
            break;
        default:
            dayWithSuffix = day + "th";
    }

    const formattedDate = `${dayWithSuffix} ${monthNames[parseInt(month, 10) - 1]} ${year} ${hour12}:${minutes}:${seconds} ${am_pm}`;
    return formattedDate;
};

const moneyFormatIndia = (num) => {
    let explrestunits = "";
    if (num.length > 3) {
        let lastthree = num.substring(num.length - 3);
        let restunits = num.substring(0, num.length - 3);
        restunits = (restunits.length % 2 === 1) ? "0" + restunits : restunits;
        let expunit = restunits.match(/.{1,2}/g);
        for (let i = 0; i < expunit.length; i++) {
            if (i === 0) {
                explrestunits += parseInt(expunit[i], 10) + ",";
            } else {
                explrestunits += expunit[i] + ",";
            }
        }
        let thecash = explrestunits + lastthree;
        return thecash;
    } else {
        return num;
    }
}

const scrollHorizontallyTo = (element) => {
    const elementRight = element.offsetLeft + element.offsetWidth;
    const elementLeft = element.offsetLeft;

    const elementParentRight = element.parentNode.offsetLeft + element.parentNode.offsetWidth;
    const elementParentLeft = element.parentNode.offsetLeft;

    if (elementRight > elementParentRight + element.parentNode.scrollLeft) {
        element.parentNode.scrollLeft = elementRight - elementParentRight;
    } else if (elementLeft < elementParentLeft + element.parentNode.scrollLeft) {
        element.parentNode.scrollLeft = elementLeft - elementParentLeft;
    }
}

const colorNameToHex = (color) => {
    if (color.startsWith("#")) {
        return color;
    }
    var colors = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"};
    
    const colorCode = colors[color.toLowerCase()];
    if (colorCode != null) {
        return colorCode;
    }
    return "#0d6efd";
}

export { playSound, showAlert, confirmLogout, showCredits, timestampToHumanTime, moneyFormatIndia, scrollHorizontallyTo, colorNameToHex };