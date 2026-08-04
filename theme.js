// Read the saved setting.
// If nothing has been saved yet, dark mode is used.
let lightModeOn =
    localStorage.getItem("lightModeOn") === "true";

let bgColor;
let panelColor;
let textColor;

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