// Read the saved setting.
// If nothing has been saved yet, dark mode is used.
let lightModeOn =
    localStorage.getItem("lightModeOn") === "true";
let largeTextOn =
    localStorage.getItem("largeTextOn") === "true";


let bgColor;
let panelColor;
let textColor;

let titleSize;
let headingSize;
let labelSize;
let smallSize;

function updateThemeColors() {
    if (lightModeOn) {
        bgColor = color(235);
        panelColor = color(220);
        textColor = color(0);
    } else {
        bgColor = color(35);
        panelColor = color(55);
        textColor = color(255);
    }
}

function saveLightMode(value) {
    lightModeOn = value;
    localStorage.setItem("lightModeOn", String(value));
}

function updateFontSizes() {

    if (largeTextOn) {
        titleSize = 40;
        headingSize = 34;
        labelSize = 22;
        smallSize = 16;
    }
    else {
        titleSize = 34;
        headingSize = 30;
        labelSize = 18;
        smallSize = 12;
    }
}

function saveLargeText(value) {
    largeTextOn = value;

    localStorage.setItem(
        "largeTextOn",
        String(value)
    );
}